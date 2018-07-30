pragma solidity ^0.4.23;

import "../dataStorage/MutablePermissionedTokenStorageConsumer.sol";
import "../PermissionedToken.sol";

/**
*
* @dev creates a PermissionedTokenMock that has the ability to upgrade its Regulator, balance, and allowance sheet locations
*
*/
contract MutableStoragePermissionedTokenMock is PermissionedToken, MutablePermissionedTokenStorageConsumer {

	constructor (address regulator, address balances, address allowances) MutablePermissionedTokenStorageConsumer(regulator, balances, allowances) public {
	}
}