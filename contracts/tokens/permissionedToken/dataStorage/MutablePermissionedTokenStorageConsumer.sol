pragma solidity ^0.4.23;

import "./PermissionedTokenStorageConsumer.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
*
* @dev A MutablePermissionedTokenStorageConsumer can upgrade its location
*
*/
contract MutablePermissionedTokenStorageConsumer is PermissionedTokenStorageConsumer, Ownable {

    // Events
	event ChangedRegulator(address _old, address _new);
	event ChangedBalanceStorage(address _old, address _new);
	event ChangedAllowanceStorage(address _old, address _new);


    // Methods

    constructor (address regulator, address balances, address allowances) PermissionedTokenStorageConsumer (regulator, balances, allowances) public {
    }

    /**
    *
    * @dev Only the MutablePermissionedTokenStorageConsumer owner can change its storage location
    * @param _newStorageAddress the new storage address
    *
    */

	function setRegulator(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_regulator)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_regulator);
		_regulator = Regulator(_newStorageAddress);
		emit ChangedRegulator(old, _newStorageAddress);
	}

	function setBalanceStorage(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_balances)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_balances);
		_balances = BalanceSheet(_newStorageAddress);
		emit ChangedBalanceStorage(old, _newStorageAddress);
	}

	function setAllowanceStorage(address _newStorageAddress) onlyOwner public {
    	require(_newStorageAddress != address(_allowances)); // require a new address to be set
		require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
		address old = address(_allowances);
		_allowances = AllowanceSheet(_newStorageAddress);
		emit ChangedAllowanceStorage(old, _newStorageAddress);
	}
}