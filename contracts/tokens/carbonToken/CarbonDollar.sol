pragma solidity ^0.4.23;

import "../permissionedToken/MutablePermissionedToken.sol";
import "../whitelistedToken/WhitelistedToken.sol";
import "./FeeSheet.sol";
import "./StablecoinWhitelist.sol";
import "../../DataMigratable.sol";

// TODO move to eternal storage pattern

contract CarbonDollar is MutablePermissionedToken {

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
        require(stablecoinWhitelist.isWhitelisted(msg.sender));
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

    /** @notice Transfers ownership of the stablecoin whitelist and fee sheets to the owner
    * of this token contract. This is useful for migrations, since the new token contract is made the
    * owner of the old token contract.
    **/
    function transferStorageOwnership() public onlyOwner {
        super.transferSO(msg.sender);
        transferSO(msg.sender);
    }

    function transferSO(address owner) internal {
        stablecoinFees.transferOwnership(owner);
        stablecoinWhitelist.transferOwnership(owner);
    }

    /** @notice Claims ownership of the stablecoin whitelist and fee sheets. Succeeds if the
    * ownership of those contracts was transferred to this contract.
    *
    * This function is strictly used for migrations.
    **/
    function claimStorageOwnership() public onlyOwner {
        super.claimSO();
        claimSO();
    }

    function claimSO() internal {
        stablecoinFees.claimOwnership();
        stablecoinWhitelist.claimOwnership();
    }

    /**
     * @notice add new stablecoin to whitelist
     */
    function whitelistToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.addStablecoin(_stablecoin); // add new stablecoin in whitelist mapping
    }

    /**
     * @notice remove existing stablecoin from whitelist
     */
    function unlistToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.removeStablecoin(_stablecoin);
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
     * @notice Set the stablecoin whitelist contract.
     * @param _whitelist Address of the stablecoin whitelist contract.
     */
    function setStablecoinWhitelist(address _whitelist) public onlyOwner {
        address oldWhitelist = address(stablecoinWhitelist);
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
        emit StablecoinWhitelistChanged(oldWhitelist, _whitelist);
    }

    function mintCarbonDollar(address _to, uint256 _amount) public requiresWhitelistedToken returns (bool) {
        return mint(_to, _amount);
    }

    /**
     * @notice Change fees associated with going from CarbonUSD to a particular WhitelistedToken.
     */
    function changeFee(address stablecoin, uint16 _newFee) public onlyOwner {
        stablecoinFees.setFee(stablecoin, _newFee);
    }

    /**
     * @notice Change the default fee associated with going from CarbonUSD to a WhitelistedToken.
     * This fee amount is used if the fee for a WhitelistedToken is not specified.
     */
    function changeDefaultFee(uint16 _newFee) public onlyOwner {
        stablecoinFees.setDefaultFee(_newFee);
    }

    /**
     * @notice user can convert CarbonUSD umbrella token into the underlying assets. This is potentially interchain (EOS, ETH, Hedera etc)
     * @param stablecoin represents the type of coin the users wishes to receive for burning carbonUSD
     * @param _amount Amount of CarbonUSD to burn.
     * we credit the user's account at the sender address with the _amount minus the percentage fee we want to charge.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(stablecoin));
        balances.subBalance(msg.sender, _amount);

        // Send back WhitelistedToken, but with a fee reduction
        uint16 feeRate;
        if (stablecoinFees.isFeeSet(stablecoin)) // If fee for coin is not set
            feeRate = stablecoinFees.fees(stablecoin);
        else
            feeRate = stablecoinFees.defaultFee();

        uint256 chargedFee = stablecoinFees.computeFee(_amount, feeRate);
        uint256 feedAmount = _amount.sub(chargedFee);
        transfer(owner, chargedFee); // Transfer fee, sent to owner of this contract (Carbon-12 Labs).
        WhitelistedToken(stablecoin).transfer(msg.sender, feedAmount);
        return true;
    }
}