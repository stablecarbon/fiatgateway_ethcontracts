pragma solidity ^0.4.24;

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

    /**
    * @dev claim ownership of permission sheet passed into constructor.
    **/
    function claimPermissionOwnership() public {
        permissions.claimOwnership();
    }

    /**
    * @dev claim ownership of validator sheet passed into constructor.
    **/
    function claimValidatorOwnership() public {
        validators.claimOwnership();
    }
}