pragma solidity ^0.4.24;

import "../DelayedUpgradeabilityProxy.sol";
import '../../helpers/Ownable.sol';

contract DelayedUpgradeabilityProxyMock is DelayedUpgradeabilityProxy, Ownable {
    constructor(address i) public DelayedUpgradeabilityProxy(i) {}

    function upgradeTo(address implementation) public onlyOwner {
        _setPendingUpgrade(implementation);
    }
}