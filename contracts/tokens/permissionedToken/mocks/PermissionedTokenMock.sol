pragma solidity ^0.4.23;

import "../dataStorage/PermissionedTokenStorageConsumer.sol";
import "../PermissionedToken.sol";

/**
*
* @dev creates a PermissionedToken connected to empty Balance, Allowance storages and a Regulator
*
*/
contract PermissionedTokenMock is PermissionedToken {


	constructor (address regulator) public {
		_regulator = Regulator(regulator);
		_balances = new BalanceSheet();
		_allowances = new AllowanceSheet();
	}
}