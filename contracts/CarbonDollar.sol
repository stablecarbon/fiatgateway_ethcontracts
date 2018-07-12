pragma solidity ^0.4.23;

import "./permissionedToken/PermissionedToken.sol";
import "./whitelistedToken/WhitelistedToken.sol";
import "./FeeSheet.sol";
import "./StablecoinWhitelist.sol";

contract CarbonDollar is PermissionedToken {

    // TODO: Some sort of blacklist/whitelisting (similar to permissionedToken) @tanishq/@sam
    // Random Thought: GreyList (mark Dirty Money without prevent it from being transferred or receiving)
    // TODO: Upgradeability of carbonUSD and similar umbrella/meta-token contracts @tanishq/@sam

    // carbonUSD is an umbrella / meta-token to be trading on exchanges. It's a wrapper function on top of 
    // all USD stablecoin products Carbon launches.

    // Carbon-12 Labs, INC owns this smart contract.

    // Global Variables
    uint16 public defaultFee; // this fee will be charged for users trying to convert CarbonUSD into the original tokens
                               // units of this number: tenth of a percent
    FeeSheet public stablecoinFees;

    // Whitelist of stablecoins that can be traded into Carbon. The addresses stored in this list are actually
    // proxies to CarbonToken objects.
    StablecoinWhitelist public stablecoinWhitelist;

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
        claimStorageOwnership();
    }

    function transferStorageOwnership() public onlyOwner {
        stablecoinFees.transferOwnership(msg.sender);
        stablecoinWhitelist.transferOwnership(msg.sender);
    }

    function claimStorageOwnership() internal {
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

    /** Ensures that the caller of the function is a whitelisted token. */
    modifier requiresWhitelistedToken() {
        require(stablecoinWhitelist.isWhitelisted(msg.sender));
        _;
    }
    
    function setFeeSheet(address _sheet) public onlyOwner {
        stablecoinFees = FeeSheet(_sheet);
    }
    
    function setStablecoinWhitelist(address _whitelist) public onlyOwner {
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
    }

    function mintCarbonDollar(address _to, uint256 _amount) public requiresWhitelistedToken returns (bool) {
        return mint(_to, _amount);
    }

    /**
     * @notice change fees associated with going from CarbonUSD -> Whitelisted Tokens
     */
    function changeFee(address stablecoin, uint16 _newFee) public onlyOwner returns (bool) {
        stablecoinFees.setFee(stablecoin, _newFee);
        return true;
    }

    function changeDefaultFee(uint16 _newFee) public onlyOwner returns (bool) {
        defaultFee = _newFee;
        return true;
    }

    function computeFee(uint256 amount, uint16 fee) public pure returns (uint256) {
        return (amount * fee) / 1000;
    }

    /**
     * @notice user can convert CarbonUSD umbrella token into the underlying assets. This is potentially interchain (EOS, ETH, Hedera etc)
     * @param stablecoin represents the type of coin the users wishes to receive for burning carbonUSD
     * @param _amount Amount of CarbonUSD to burn.
     * we credit the user's account at the sender address with the _amount minus the percentage fee we want to charge.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(stablecoin));
        burnAllArgs(msg.sender, _amount, "");

        // Remit back WhitelistedToken, but with a fee reduction
        uint16 fee = stablecoinFees.fees(stablecoin);
        if (fee == 0) // If fee for coin is not set
            fee = defaultFee;
        uint256 feedAmount = _amount.sub(computeFee(_amount, fee));
        WhitelistedToken(stablecoin).transfer(msg.sender, feedAmount);
        return true;
    }
}