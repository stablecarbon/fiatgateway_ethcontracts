pragma solidity ^0.4.23;

import "../MutablePermissionedToken.sol";
import "../../mocks/PermissionedTokenMock.sol";

/**
* @title MutablePermissionedTokenMock
*/
contract MutablePermissionedTokenMock is PermissionedTokenMock, MutablePermissionedToken {
    constructor(address v,
                address m,
                address b,
                address w, 
                address n)
            PermissionedTokenMock(v, m, b, w, n)
            public {
        allowances = new AllowanceSheet();
        balances = new BalanceSheet();
    }
}