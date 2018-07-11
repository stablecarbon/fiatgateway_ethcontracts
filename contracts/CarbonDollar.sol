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
    uint256 public defaultFee; // the fee will be charged for users trying to convert CarbonUSD into the original tokens
    FeeSheet public stablecoinFees;

    // Events
	event StablecoinAdded(address stablecoin);
	event StablecoinRemoved(address stablecoin);

    // Whitelist of stablecoins that can be traded into Carbon. The addresses stored in this list are actually
    // proxies to CarbonToken objects.
    StablecoinWhitelist public whitelist;
    BalanceSheet public stablecoinBalances;

    function whitelistToken(address _stablecoin) public onlyOwner {
        whitelist.addStablecoin(stablecoin); // add new stablecoin in whitelist mapping
    }

    function unlistToken(address _stablecoin) public onlyOwner {
        whitelist.removeStablecoin(stablecoin);
    }

    function mintCarbonDollar(address stablecoin, address _to, uint256 _amount) public onlyOwner returns (bool) {
        require(whitelist[_stablecoin] == true);
        CarbonToken(stablecoin).burn(_to, _amount);
        stablecoinBalances.addBalance(stablecoin, _amount);
        return true;
    }

    // Carbon can change the fee associated with a stablecoin
    function changeFee(address stablecoin, uint256 _newFee) public onlyOwner returns (bool) {
        stablecoinFees.setFee(_newFee);
        return true;
    }

    // Carbon can change the default fee that applies to stablecoins, when the stablecoin fee is not specified
    function changeDefaultFee(uint256 _newFee) public onlyOwner returns (bool) {
        defaultFee = _newFee;
        return true;
    }

    // User can convert CarbonUSD umbrella token into the underlying assets. This is potentially interchain (EOS, ETH, Hedera etc)
    function burnCarbonDollar(address stablecoin, address _to, uint256 _amount) public onlyOwner returns (bool) {
        require(whitelist[_stablecoin] == true);
        stablecoinBalances.subBalance(stablecoin, _amount);
        
        uint256 feedAmount = _amount;
        CarbonToken(stablecoin).mint(_to, feedAmount);
        return true;
    }
}