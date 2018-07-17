pragma solidity ^0.4.23;

import "./PermissionStorage.sol";
import "./UserPermissionStorage.sol";


contract RegulatorProxy is PermissionStorage, UserPermissionStorage {}