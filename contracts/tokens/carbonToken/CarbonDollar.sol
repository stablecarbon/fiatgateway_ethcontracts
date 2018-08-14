pragma solidity ^0.4.24;
import "./dataStorage/MutableCarbonDollarStorage.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../whitelistedToken/WhitelistedToken.sol";

/**
* @title CarbonDollar
* @notice The main functionality for the CarbonUSD metatoken. (CarbonUSD is just a proxy
* on top of this token contract.) This is a permissioned token, so users have to be 
* whitelisted before they can do any mint/burn/convert operation.
*/
contract CarbonDollar is MutableCarbonDollarStorage, PermissionedToken {
    // Events
    event ConvertedToWT(address indexed user, uint256 amount);
    event BurnedCUSD(address indexed user, uint256 feedAmount, uint256 chargedFee);
    /**
        Modifiers
    */
    modifier requiresWhitelistedToken() {
        require(stablecoinWhitelist.isWhitelisted(msg.sender), "Sender must be a whitelisted token contract");
        _;
    }

    /** CONSTRUCTOR
    * @dev Passes along arguments to base class.
    */
    constructor(address r, address b, address a, address f, address s) 
    PermissionedToken(r, b, a) 
    MutableCarbonDollarStorage(f, s) public {}

    /**
     * @notice Add new stablecoin to whitelist.
     * @param _stablecoin Address of stablecoin contract.
     */
    function listToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.addStablecoin(_stablecoin); 
    }

    /**
     * @notice Remove existing stablecoin from whitelist.
     * @param _stablecoin Address of stablecoin contract.
     */
    function unlistToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.removeStablecoin(_stablecoin);
    }

    /**
     * @notice Indicate if stablecoin is whitelisted or not.
     * @param _stablecoin Address of stablecoin contract.
     * @return Whether or not the stablecoin is on the whitelist.
     */
    function isWhitelisted(address _stablecoin) public view returns (bool) {
        return stablecoinWhitelist.isWhitelisted(_stablecoin);
    }

    /**
     * @notice Change fees associated with going from CarbonUSD to a particular stablecoin.
     * @param stablecoin Address of the stablecoin contract.
     * @param _newFee The new fee rate to set, in tenths of a percent. 
     */
    function setFee(address stablecoin, uint16 _newFee) public onlyOwner {
        require(stablecoinWhitelist.isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        stablecoinFees.setFee(stablecoin, _newFee);
    }

    /**
     * @notice Remove fees associated with going from CarbonUSD to a particular stablecoin.
     * The default fee still may apply.
     * @param stablecoin Address of the stablecoin contract.
     */
    function removeFee(address stablecoin) public onlyOwner {
        require(stablecoinWhitelist.isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        stablecoinFees.removeFee(stablecoin);
    }

    /**
     * @notice Change the default fee associated with going from CarbonUSD to a WhitelistedToken.
     * This fee amount is used if the fee for a WhitelistedToken is not specified.
     * @param _newFee The new fee rate to set, in tenths of a percent.
     */
    function setDefaultFee(uint16 _newFee) public onlyOwner {
        stablecoinFees.setDefaultFee(_newFee);
    }

    /**
     * @notice Get the fee associated with going from CarbonUSD to a specific WhitelistedToken.
     * @param stablecoin The stablecoin whose fee is being checked.
     * @return The fee associated with the stablecoin.
     */
    function getFee(address stablecoin) public view returns (uint16) {
        return stablecoinFees.fees(stablecoin);
    }

    /**
     * @notice Get the default fee associated with going from CarbonUSD to a specific WhitelistedToken.
     * @return The default fee for stablecoin trades.
     */
    function getDefaultFee() public view returns (uint16) {
        return stablecoinFees.defaultFee();
    }

    /**
     * @notice Mints CUSD on behalf of a user. Note the use of the "requiresWhitelistedToken"
     * modifier; this means that minting authority does not belong to any personal account; 
     * only whitelisted token contracts can call this function.
     * @param _to User to send CUSD to
     * @param _amount Amount of CarbonUSD to burn.
     */
    function mint(address _to, uint256 _amount) public requiresWhitelistedToken returns (bool) {
        return _mint(_to, _amount);
    }

    function _mint(address _to, uint256 _amount) internal returns (bool) {
        return super._mint(_to, _amount);
    }

    /**
     * @notice user can convert CarbonUSD umbrella token into the underlying assets. This is potentially interchain (EOS, ETH, Hedera etc)
     * @param stablecoin represents the type of coin the users wishes to receive for burning carbonUSD
     * @param _amount Amount of CarbonUSD to convert.
     * we credit the user's account at the sender address with the _amount minus the percentage fee we want to charge.
     */
    function convertCarbonDollar(address stablecoin, uint256 _amount) public requiresPermission returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        WhitelistedToken w = WhitelistedToken(stablecoin);
        require(w.balanceOf(address(this)) >= _amount, "Carbon escrow account in WT0 doesn't have enough tokens for burning");
 
        // Send back WT0 to calling user, but with a fee reduction.
        // Transfer this fee into this Carbon account (this contract's address)
        uint256 chargedFee = stablecoinFees.computeFee(_amount, computeFeeRate(stablecoin));
        uint256 feedAmount = _amount.sub(chargedFee);
        _burn(msg.sender, _amount);
        w.transfer(msg.sender, feedAmount);
        w.burn(chargedFee);
        _mint(address(this), chargedFee);
        emit ConvertedToWT(msg.sender, _amount);
        return true;
    }

     /**
     * @notice Burns CarbonDollar.
     * @param stablecoin Represents the stablecoin whose fee will be charged.
     * @param _amount Amount of CarbonUSD to burn.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public requiresPermission returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(stablecoin), "Stablecoin must be whitelisted prior to setting conversion fee");
        WhitelistedToken w = WhitelistedToken(stablecoin);
        require(w.balanceOf(address(this)) >= _amount, "Carbon escrow account in WT0 doesn't have enough tokens for burning");
 
        // Burn user's CUSD, but with a fee reduction.
        uint256 chargedFee = stablecoinFees.computeFee(_amount, computeFeeRate(stablecoin));
        uint256 feedAmount = _amount.sub(chargedFee);
        _burn(msg.sender, _amount);
        w.burn(_amount);
        _mint(address(this), chargedFee);
        emit BurnedCUSD(msg.sender, feedAmount, chargedFee); // Whitelisted trust account should send user feedAmount USD
        return true;
    }

    /** Computes fee percentage associated with burning into a particular stablecoin.
     * @param stablecoin The stablecoin whose fee will be charged. Precondition: is a whitelisted
     * stablecoin.
     * @return The fee that will be charged. If the stablecoin's fee is not set, the default
     * fee is returned.
     */
    function computeFeeRate(address stablecoin) public view returns (uint16 feeRate) {
        if (stablecoinFees.isFeeSet(stablecoin)) // If fee for coin is not set
            feeRate = stablecoinFees.fees(stablecoin);
        else
            feeRate = stablecoinFees.defaultFee();
    }

    /**
     * @notice Compute the fee for converting a particular amount of CarbonUSD to a specific WhitelistedToken.
     * @param amount The amount that the fee will be charged on.
     * @param stablecoin The stablecoin to check fees for.
     * @return The fee charged on the amount for the specified whitelisted token.
     */
    function computeStablecoinFee(uint256 amount, address stablecoin) public view returns (uint256) {
        return stablecoinFees.computeStablecoinFee(amount, stablecoin);
    }
}