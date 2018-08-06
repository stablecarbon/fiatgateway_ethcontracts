pragma solidity ^0.4.24;

import "../DelayedUpgradeabilityProxy.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DelayedUpgradeabilityProxyMock is DelayedUpgradeabilityProxy, Ownable {
    constructor(address i) DelayedUpgradeabilityProxy(i) public {}

    function upgradeTo(address implementation) public onlyOwner {
        _setPendingUpgrade(implementation);
    }
}