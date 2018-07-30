pragma solidity ^0.4.23;

import "./RegulatorStorageConsumer.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
*
* @dev A MutableRegulatorStorageConsumer can upgrade its permission and validator sheet location
*
*/
contract MutableRegulatorStorageConsumer is RegulatorStorageConsumer, Ownable {

    // Events
	event ChangedPermissionStorage(address _old, address _new);
	event ChangedValidatorStorage(address _old, address _new);


    // Methods

    constructor (address permissions, address validators) RegulatorStorageConsumer(permissions, validators) public {
    }

    /**
    *
    * @dev Only the MutableRegulatorStorageConsumer owner can change its storage location
    * @param _newStorageAddress the new storage address
    *
    */

	function setPermissionStorage(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_permissions)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_permissions);
		_permissions = PermissionSheet(_newStorageAddress);
		emit ChangedPermissionStorage(old, _newStorageAddress);
	}

	function setValidatorStorage(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_validators)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_validators);
		_validators = ValidatorSheet(_newStorageAddress);
		emit ChangedValidatorStorage(old, _newStorageAddress);
	}
}