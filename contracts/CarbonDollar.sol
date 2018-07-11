pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./modularERC20/BalanceSheet.sol";
import "./permissions/PermissionedToken.sol";
import "./CarbonToken.sol";

contract CarbonDollar is Ownable, PermissionedToken {

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

    /**
     * @notice add new stablecoin to whitelist
     */
    function whitelistToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.addStablecoin(stablecoin); // add new stablecoin in whitelist mapping
    }

    /**
     * @notice remove existing stablecoin from whitelist
     */
    function unlistToken(address _stablecoin) public onlyOwner {
        stablecoinWhitelist.removeStablecoin(stablecoin);
    }

    /** Ensures that the caller of the function is a whitelisted token. */
    modifier requiresWhitelistedToken() {
        require(stablecoinWhitelist.isWhitelisted(msg.sender));
        _;
    }

    function mintCarbonDollar(address _to, uint256 _amount) public requiresWhitelistedToken returns (bool) {
        return mint(_to, _amount);
    }

    /**
     * @notice change fees associated with going from CarbonUSD -> Whitelisted Tokens
     */
    function changeFee(address stablecoin, uint256 _newFee) public onlyOwner returns (bool) {
        stablecoinFees.setFee(stablecoin, _newFee);
        return true;
    }

    function changeDefaultFee(uint256 _newFee) public onlyOwner returns (bool) {
        defaultFee = _newFee;
        return true;
    }

    function computeFee(uint256 amount, uint16 fee) pure returns (uint256) {
        return (amount * fee) / 1000;
    }

    /**
     * @notice user can convert CarbonUSD umbrella token into the underlying assets. This is potentially interchain (EOS, ETH, Hedera etc)
     * @params _stablecoin represents the type of coin the users wishes to receive for burning carbonUSD
     * @params _fee is deterrmined
     * we credit the user's account at the _to address with the _amount minus the percentage fee we want to charge.
     */
    function burnCarbonDollar(address stablecoin, uint256 _amount) public returns (bool) {
        require(stablecoinWhitelist.isWhitelisted(_stablecoin));
        bool burned = burn(_to, _amount);
        if (!burned)
            return false;

        uint16 fee = feeSheet.getFee(stablecoin);
        if (fee == 0) // Fee for coin is not set
            fee = defaultFee;
        uint256 feedAmount = _amount.sub(computeFee(_amount, fee));
        CarbonToken(stablecoin).mint(_to, feedAmount);
        return true;
    }
}