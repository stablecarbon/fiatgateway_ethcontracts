pragma solidity ^0.4.23;

import "./PermissionSheet.sol";
import "./ValidatorSheet.sol";

/**
*
* @dev contains a RegulatorStorage 
*
*/
contract RegulatorStorageState {

    /**
    	Storage
    */
    PermissionSheet public _permissions;
    ValidatorSheet public _validators;

}