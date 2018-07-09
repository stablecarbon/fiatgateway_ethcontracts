pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
* @title PermissionedTokenProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the CarbonToken to the correct version of the PermissionedToken associated
* with a currency.
*
*/
contract PermissionedTokenProxy is AdminUpgradeabilityProxy {
    // TODO PermissionedToken constructor
}