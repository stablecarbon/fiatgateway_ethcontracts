pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
* @title RegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the PermissionedToken to the correct version of the Regulator
* service.
*
*/
contract RegulatorProxy is AdminUpgradeabilityProxy {}