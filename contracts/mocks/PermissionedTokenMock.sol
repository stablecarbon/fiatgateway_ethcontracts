pragma solidity ^0.4.23;

import "../PermissionedToken.sol";

contract PermissionedTokenMock is PermissionedToken {

	constructor(address initialAccount, uint initialBalance) public {
		balances[initialAccount] = initialBalance;
	}
}