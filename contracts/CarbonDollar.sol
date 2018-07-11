pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./modularERC20/BalanceSheet.sol";
import "./CarbonToken.sol";

contract CarbonDollar is Ownable {

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
    StablecoinWhitelist public whitelist;

    // A balance sheet indicating how much of each stablecoin is owned by this contract.
    BalanceSheet public stablecoinBalances;

    /**
     * @notice add new stablecoin to whitelist
     */
    function whitelistToken(address _stablecoin) public onlyOwner {
        whitelist.addStablecoin(stablecoin); // add new stablecoin in whitelist mapping
    }

    /**
     * @notice remove existing stablecoin from whitelist
     */
    function unlistToken(address _stablecoin) public onlyOwner {
        whitelist.removeStablecoin(stablecoin);
    }

    /**
     * @notice TODO: if stablecoin is whitelisted, proceed to accept the stablecoin into the current smart contract address
     * TODO: once the stablecoin is held in this escrow, we mint new carbonUSD in the quantity required and to the address listed
     */
    function mintCarbonDollar(address stablecoin, address _to, uint256 _amount) public onlyOwner returns (bool) {
        require(whitelist[_stablecoin] == true);
        CarbonToken(stablecoin).burn(_to, _amount);
        stablecoinBalances.addBalance(stablecoin, _amount);
        return true;
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
    function burnCarbonDollar(address stablecoin, address _to, uint256 _amount) public onlyOwner returns (bool) {
        require(whitelist[_stablecoin] == true);
        stablecoinBalances.subBalance(stablecoin, _amount);

        uint16 fee = feeSheet.getFee(stablecoin);
        if (fee == 0) // Fee for coin is not set
            fee = defaultFee;
        uint256 feedAmount = _amount.sub(computeFee(_amount, fee));
        CarbonToken(stablecoin).mint(_to, feedAmount);
        return true;
    }
}