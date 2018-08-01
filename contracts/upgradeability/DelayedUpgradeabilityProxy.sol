pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol";

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
    * @notice Sets the pending implementation address of the proxy.
    * This function is internal--uses of this proxy should wrap this function
    * with a public function in order to make it externally callable.
    * @param implementation Address of the new implementation.
    */
    function _setPendingUpgrade(address implementation) internal {
        address oldPendingImplementation = _pendingImplementation;
        _pendingImplementation = implementation;
        pendingImplementationIsSet = true;
        emit PendingImplementationChanged(oldPendingImplementation, implementation);
        pendingImplementationApplicationDate = now.add(UPGRADE_DELAY);
    }

    /**
    * @notice Overrides the _willFallback() function of Proxy, which enables some code to
    * be executed prior to the fallback function. In this case, the purpose of this code
    * is to automatically switch the implementation to the pending implementation if the 
    * wait period of UPGRADE_DELAY (28 days) has been satisfied.
    */
    function _willFallback() internal {
        if (pendingImplementationIsSet && now > pendingImplementationApplicationDate) {
            _upgradeTo(_pendingImplementation());
            pendingImplementationIsSet = false;
        }
    }
}