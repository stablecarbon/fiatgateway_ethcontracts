pragma solidity ^0.4.23;

import "./RegulatorStorageConsumer.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
*
* @dev A MutableRegulatorStorageConsumer can upgrade its RegulatorStorage location
*
*/
contract MutableRegulatorStorageConsumer is RegulatorStorageConsumer, Ownable {

    // Events
	event ChangedRegulatorStorage(address _old, address _new);


    // Methods

    constructor (address regulatorStorage) RegulatorStorageConsumer(regulatorStorage) public {
    }

    /**
    *
    * @dev Only the MutableRegulatorStorageConsumer owner can change its storage location
    * @param _newStorageAddress the new storage address
    *
    */
    function setStorage(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_storage)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_storage);
		_storage = RegulatorStorage(_newStorageAddress);
		emit ChangedRegulatorStorage(old, _newStorageAddress);

	}
}