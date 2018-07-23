pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoTokens.sol";
import "../permissionedToken/mutablePermissionedToken/MutablePermissionedToken.sol";
import "../whitelistedToken/WhitelistedToken.sol";
import "./helpers/FeeSheet.sol";
import "./helpers/StablecoinWhitelist.sol";
import "../../DataMigratable.sol";

contract CarbonDollar is DataMigratable, MutablePermissionedToken, HasNoTokens {

    // TODO: Some sort of blacklist/whitelisting (similar to permissionedToken) @tanishq/@sam
    // Random Thought: GreyList (mark Dirty Money without prevent it from being transferred or receiving)
    // TODO: Upgradeability of carbonUSD and similar umbrella/meta-token contracts @tanishq/@sam

    // carbonUSD is an umbrella / meta-token to be trading on exchanges. It's a wrapper function on top of 
    // all USD stablecoin products Carbon launches.

    // Carbon-12 Labs, INC owns this smart contract.

    /**
        Global Variables
    */
    FeeSheet public stablecoinFees;
    // Whitelist of stablecoins that can be traded into Carbon. The addresses stored in this list are actually
    // proxies to WhitelistedToken objects.
    StablecoinWhitelist public stablecoinWhitelist;

    /**
        Events
     */
    event FeeSheetChanged(address indexed oldSheet, address indexed newSheet);
    event StablecoinWhitelistChanged(address indexed oldWhitelist, address indexed newWhitelist);

    /**
        Modifiers
    */
    /** Ensures that the caller of the function is a whitelisted token. */
    modifier requiresWhitelistedToken() {
        require(AddressUtils.isContract(msg.sender)); // Must be a contract
        require(stablecoinWhitelist.isWhitelisted(msg.sender)); // Must be a whitelisted token
        _;
    }

    /**
    * @notice Function used as part of Migratable interface. Must be called when
    * proxy is assigned to contract in order to correctly assign the contract's
    * version number.
    *
    * If deploying a new contract version, the version number must be changed as well. 
    */
    function initialize() isInitializer("CarbonDollar", "1.0") public {
        // Nothing to initialize!
    }

    /** @dev Migrates data from an old CarbonDollar contract to a new one.
        Precondition: the new contract has already been transferred ownership of the old contract.
        @param _oldDollar The address of the old CarbonDollar contract. */
    function migrate(address _oldDollar) isMigration("CarbonDollar", "1.0", "1.1") public {
        CarbonDollar oldDollar = CarbonDollar(_oldDollar);
        oldDollar.claimOwnership(); // Take the proferred ownership of the old contract
        oldDollar.transferStorageOwnership();
        setFeeSheet(address(oldDollar.stablecoinFees()));
        setStablecoinWhitelist(address(oldDollar.stablecoinWhitelist()));
        claimSO();
    }

    function transferSO(address owner) internal {
        super.transferSO(owner);
        stablecoinFees.transferOwnership(owner);
        stablecoinWhitelist.transferOwnership(owner);
    }

    function claimSO() internal {
        super.claimSO();
        stablecoinFees.claimOwnership();
        stablecoinWhitelist.claimOwnership();
    }

    /**
     * @notice Set the stablecoin whitelist contract.
     * @param _whitelist Address of the stablecoin whitelist contract.
     */
    function setStablecoinWhitelist(address _whitelist) public onlyOwner {
        address oldWhitelist = address(stablecoinWhitelist);
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
        emit StablecoinWhitelistChanged(oldWhitelist, _whitelist);
    }

    /**
     * @notice Add new stablecoin to whitelist.
     * @param _stablecoin Address of stablecoin contract.
     */
    function listToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.addStablecoin(_stablecoin); // add new stablecoin in whitelist mapping
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
     * @notice Set the fee sheet for this CarbonUSD.
     * @param _sheet Address of the fee sheet.
     */
    function setFeeSheet(address _sheet) public onlyOwner {
        address oldSheet = address(stablecoinFees);
        stablecoinFees = FeeSheet(_sheet);
        emit FeeSheetChanged(oldSheet, _sheet);
    }

    /**
     * @notice Change fees associated with going from CarbonUSD to a particular stablecoin.
     * @param stablecoin Address of the stablecoin contract.
     * @param _newFee The new fee rate to set, in tenths of a percent. 
     */
    function setFee(address stablecoin, uint16 _newFee) public onlyOwner {
        require(stablecoinWhitelist.isWhitelisted(stablecoin));
        stablecoinFees.setFee(stablecoin, _newFee);
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
     * @notice A whitelisted token can issue CUSD on behalf of a user.
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
     * @param _amount Amount of CarbonUSD to burn.
     * we credit the user's account at the sender address with the _amount minus the percentage fee we want to charge.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public requiresPermission returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(stablecoin));
        WhitelistedToken w = WhitelistedToken(stablecoin);
        require(w.balanceOf(address(this)) >= _amount); // Need enough WT0 in Carbon escrow account in order for transfer to succeed!
 
        // Send back WT0 to calling user, but with a fee reduction.
        // Transfer this fee into this Carbon account (this contract's address)
        uint16 feeRate;
        if (stablecoinFees.isFeeSet(stablecoin)) // If fee for coin is not set
            feeRate = stablecoinFees.fees(stablecoin);
        else
            feeRate = stablecoinFees.defaultFee();

        uint256 chargedFee = stablecoinFees.computeFee(_amount, feeRate);
        uint256 feedAmount = _amount.sub(chargedFee);
        _burn(msg.sender, _amount);
        w.transfer(msg.sender, feedAmount);
        w.burn(chargedFee);
        _mint(address(this), chargedFee);
        return true;
    }

    function computeStablecoinFee(uint256 amount, address stablecoin) public view returns (uint256) {
        return stablecoinFees.computeStablecoinFee(amount, stablecoin);
    }
}