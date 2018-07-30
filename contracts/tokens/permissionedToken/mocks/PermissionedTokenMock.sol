pragma solidity ^0.4.23;

import "../dataStorage/PermissionedTokenStorageConsumer.sol";
import "../PermissionedToken.sol";

/**
*
* @dev creates a PermissionedToken connected to empty Balance, Allowance storages and a Regulator
*
*/
contract PermissionedTokenMock is PermissionedToken, PermissionedTokenStorageConsumer {


	constructor (address regulator, address balances, address allowances) PermissionedTokenStorageConsumer(regulator, balances, allowances) public {

	}
}