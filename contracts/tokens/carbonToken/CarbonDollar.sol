pragma solidity ^0.4.24;

import "./dataStorage/CarbonDollarStorage.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../whitelistedToken/WhitelistedToken.sol";

/**
* @title CarbonDollar
* @notice The main functionality for the CarbonUSD metatoken. (CarbonUSD is just a proxy
* that implements this contract's functionality.) This is a permissioned token, so users have to be 
* whitelisted before they can do any mint/burn/convert operation. Every CarbonDollar token is backed by one
* whitelisted stablecoin credited to the balance of this contract address.
*/
contract CarbonDollar is PermissionedToken {
    
    // Events

    event ConvertedToWT(address indexed user, uint256 amount);
    event BurnedCUSD(address indexed user, uint256 feedAmount, uint256 chargedFee);
    
    /**
        Modifiers
    */
    modifier requiresWhitelistedToken() {
        require(isWhitelisted(msg.sender), "Sender must be a whitelisted token contract");
        _;
    }

    CarbonDollarStorage public tokenStorage_CD;

    /** CONSTRUCTOR
    * @dev Passes along arguments to base class.
    */
    constructor(address _regulator) public PermissionedToken(_regulator) {

        // base class override
        regulator = Regulator(_regulator);

        tokenStorage_CD = new CarbonDollarStorage();
    }

    /**
     * @notice Add new stablecoin to whitelist.
     * @param _stablecoin Address of stablecoin contract.
     */
    function listToken(address _stablecoin) public onlyOwner whenNotPaused {
        tokenStorage_CD.addStablecoin(_stablecoin); 
    }

    /**
     * @notice Remove existing stablecoin from whitelist.
     * @param _stablecoin Address of stablecoin contract.
     */
    function unlistToken(address _stablecoin) public onlyOwner whenNotPaused {
        tokenStorage_CD.removeStablecoin(_stablecoin);
    }

    /**
     * @notice Change fees associated with going from CarbonUSD to a particular stablecoin.
     * @param stablecoin Address of the stablecoin contract.
     * @param _newFee The new fee rate to set, in tenths of a percent. 
     */
    function setFee(address stablecoin, uint256 _newFee) public onlyOwner whenNotPaused {
        require(isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        tokenStorage_CD.setFee(stablecoin, _newFee);
    }

    /**
     * @notice Remove fees associated with going from CarbonUSD to a particular stablecoin.
     * The default fee still may apply.
     * @param stablecoin Address of the stablecoin contract.
     */
    function removeFee(address stablecoin) public onlyOwner whenNotPaused {
        require(isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
       tokenStorage_CD.removeFee(stablecoin);
    }

    /**
     * @notice Change the default fee associated with going from CarbonUSD to a WhitelistedToken.
     * This fee amount is used if the fee for a WhitelistedToken is not specified.
     * @param _newFee The new fee rate to set, in tenths of a percent.
     */
    function setDefaultFee(uint256 _newFee) public onlyOwner whenNotPaused {
        tokenStorage_CD.setDefaultFee(_newFee);
    }

    /**
     * @notice Mints CUSD on behalf of a user. Note the use of the "requiresWhitelistedToken"
     * modifier; this means that minting authority does not belong to any personal account; 
     * only whitelisted token contracts can call this function. The intended functionality is that the only
     * way to mint CUSD is for the user to actually burn a whitelisted token to convert into CUSD
     * @param _to User to send CUSD to
     * @param _amount Amount of CarbonUSD to mint.
     */
    function mint(address _to, uint256 _amount) public requiresWhitelistedToken whenNotPaused {
        _mint(_to, _amount);
    }

    /**
     * @notice user can convert CarbonUSD umbrella token into a whitelisted stablecoin. 
     * @param stablecoin represents the type of coin the users wishes to receive for burning carbonUSD
     * @param _amount Amount of CarbonUSD to convert.
     * we credit the user's account at the sender address with the _amount minus the percentage fee we want to charge.
     */
    function convertCarbonDollar(address stablecoin, uint256 _amount) public userNotBlacklisted(msg.sender) whenNotPaused  {
        require(isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        WhitelistedToken whitelisted = WhitelistedToken(stablecoin);
        require(whitelisted.balanceOf(address(this)) >= _amount, "Carbon escrow account in WT0 doesn't have enough tokens for burning");
 
        // Send back WT0 to calling user, but with a fee reduction.
        // Transfer this fee into the whitelisted token's CarbonDollar account (this contract's address)
        uint256 chargedFee = tokenStorage_CD.computeFee(_amount, computeFeeRate(stablecoin));
        uint256 feedAmount = _amount.sub(chargedFee);
        _burn(msg.sender, _amount);
        require(whitelisted.transfer(msg.sender, feedAmount));
        whitelisted.burn(chargedFee);
        _mint(address(this), chargedFee);
        emit ConvertedToWT(msg.sender, _amount);
    }

     /**
     * @notice burns CarbonDollar and an equal amount of whitelisted stablecoin from the CarbonDollar address
     * @param stablecoin Represents the stablecoin whose fee will be charged.
     * @param _amount Amount of CarbonUSD to burn.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public userNotBlacklisted(msg.sender) whenNotPaused {
        _burnCarbonDollar(msg.sender, stablecoin, _amount);
    }

    /** 
    * @notice release collected CUSD fees to owner 
    * @param _amount Amount of CUSD to release
    * @return `true` if successful 
    */
    function releaseCarbonDollar(uint256 _amount) public onlyOwner returns (bool) {
        require(_amount <= balanceOf(address(this)),"not enough balance to transfer");

        tokenStorage.subBalance(address(this), _amount);
        tokenStorage.addBalance(msg.sender, _amount);
        emit Transfer(address(this), msg.sender, _amount);
        return true;
    }

    /** Computes fee percentage associated with burning into a particular stablecoin.
     * @param stablecoin The stablecoin whose fee will be charged. Precondition: is a whitelisted
     * stablecoin.
     * @return The fee that will be charged. If the stablecoin's fee is not set, the default
     * fee is returned.
     */
    function computeFeeRate(address stablecoin) public view returns (uint256 feeRate) {
        if (getFee(stablecoin) > 0) 
            feeRate = getFee(stablecoin);
        else
            feeRate = getDefaultFee();
    }

    /**
    * @notice Check if whitelisted token is whitelisted
    * @return bool true if whitelisted, false if not
    **/
    function isWhitelisted(address _stablecoin) public view returns (bool) {
        return tokenStorage_CD.whitelist(_stablecoin);
    }

    /**
     * @notice Get the fee associated with going from CarbonUSD to a specific WhitelistedToken.
     * @param stablecoin The stablecoin whose fee is being checked.
     * @return The fee associated with the stablecoin.
     */
    function getFee(address stablecoin) public view returns (uint256) {
        return tokenStorage_CD.fees(stablecoin);
    }

    /**
     * @notice Get the default fee associated with going from CarbonUSD to a specific WhitelistedToken.
     * @return The default fee for stablecoin trades.
     */
    function getDefaultFee() public view returns (uint256) {
        return tokenStorage_CD.defaultFee();
    }

    function _burnCarbonDollar(address _tokensOf, address _stablecoin, uint256 _amount) internal {
        require(isWhitelisted(_stablecoin), "Stablecoin must be whitelisted prior to burning");
        WhitelistedToken whitelisted = WhitelistedToken(_stablecoin);
        require(whitelisted.balanceOf(address(this)) >= _amount, "Carbon escrow account in WT0 doesn't have enough tokens for burning");

        // Burn user's CUSD, but with a fee reduction.
        uint256 chargedFee = tokenStorage_CD.computeFee(_amount, computeFeeRate(_stablecoin));
        uint256 feedAmount = _amount.sub(chargedFee);
        _burn(_tokensOf, _amount);
        whitelisted.burn(_amount);
        _mint(address(this), chargedFee);
        emit BurnedCUSD(_tokensOf, feedAmount, chargedFee); // Whitelisted trust account should send user feedAmount USD
    }

}