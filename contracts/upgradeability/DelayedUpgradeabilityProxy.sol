pragma solidity ^0.4.23;

import "./dataStorage/MutableCarbonDollarStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";

/** 
 * @title DelayedUpgradeabilityProxy
 * @notice Implements an upgradeability proxy with the option of
 * introducing pending implementations. 
 */
contract DelayedUpgradeabilityProxy is UpgradeabilityProxy {
    using SafeMath for uint256;

    address public _pendingImplementation;
    bool public pendingImplementationIsSet;
    uint256 pendingImplementationApplicationDate; // Date on which to switch all contract calls to the new implementation
    uint256 public UPGRADE_DELAY = 4 weeks;

    event PendingImplementationChanged(address oldPendingImplementation, address newPendingImplementation);

    constructor(address i) UpgradeabilityProxy(i) public {}

    /**
    * @dev Sets the pending implementation address of the proxy.
    * @param newImplementation Address of the new implementation.
    */
    function _setPendingUpgrade(address implementation) internal {
        address oldPendingImplementation = _pendingImplementation;
        _pendingImplementation = implementation;
        pendingImplementationIsSet = true;
        emit PendingImplementationChanged(oldPendingImplementation, implementation);
        pendingImplementationApplicationDate = now.add(UPGRADE_DELAY);
    }

    /**
    * @dev Overrides the _willFallback() function of Proxy, which enables some code to
    * be executed prior to the fallback function. In this case, the purpose of this code
    * is to automatically switch the implementation to the pending implementation if the 
    * wait period of 28 days has been satisfied.
    */
    function _willFallback() internal {
        if (pendingImplementationIsSet && now > pendingImplementationApplicationDate) {
            _upgradeTo(_pendingImplementation());
            pendingImplementationIsSet = false;
        }
    }
}