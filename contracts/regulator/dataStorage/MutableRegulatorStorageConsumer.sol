pragma solidity ^0.4.23;

import "./RegulatorStorageConsumer.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';


contract MutableRegulatorStorageConsumer is RegulatorStorageConsumer {

    // Events
	event ChangedRegulatorStorage(address _old, address _new);


    // Methods

    function setStorage(address _newStorageAddress) public {
    	require(_newStorageAddress != address(_storage)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_storage);
		_storage = RegulatorStorage(_newStorageAddress);
		emit ChangedRegulatorStorage(old, _newStorageAddress);

	}
}