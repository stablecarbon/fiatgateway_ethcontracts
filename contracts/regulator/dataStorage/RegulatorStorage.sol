pragma solidity ^0.4.23;

import "./PermissionSheet.sol";
import "./ValidatorSheet.sol";

/**
*
* @dev contains a PermissionSheet and a ValidatorSheet
*
*/
contract RegulatorStorage {
    /**
    	Storage
    */
    PermissionSheet public permissions;
    ValidatorSheet public validators;

    /**
    * @dev a RegulatorStorage can set its storages only once, on construction
    *
    **/
    constructor (address _permissions, address _validators) public {
        permissions = PermissionSheet(_permissions);
        validators = ValidatorSheet(_validators);
    }
}