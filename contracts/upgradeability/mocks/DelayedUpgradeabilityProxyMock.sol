pragma solidity ^0.4.23;

import "../DelayedUpgradeabilityProxy.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/** 
 * @title DelayedUpgradeabilityProxy
 * @notice Implements an upgradeability proxy with the option of
 * introducing pending implementations. 
 */
contract DelayedUpgradeabilityProxyMock is DelayedUpgradeabilityProxy, Ownable {
    constructor(address i) DelayedUpgradeabilityProxy(i) public {}

    function upgradeTo(address implementation) public onlyOwner {
        _setPendingUpgrade(implementation);
    }
}