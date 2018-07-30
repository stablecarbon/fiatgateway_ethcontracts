pragma solidity ^0.4.23;

import "./RegulatorStorageState.sol";


/**
*
* @dev a RegulatorStorageConsumer is constructed by setting a RegulatorStorage location
*
*/
contract RegulatorStorageConsumer is RegulatorStorageState {


    /**
    * @dev a RegulatorStorageConsumer can set its storage only once, on construction
    *
    **/
    constructor (address permissions, address validators) public {
    	_permissions = PermissionSheet(permissions);
    	_validators = ValidatorSheet(validators);

    }

}