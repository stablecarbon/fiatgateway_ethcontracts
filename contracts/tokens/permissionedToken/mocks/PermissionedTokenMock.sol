pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../../../regulator/Regulator.sol";
import "../helpers/AllowanceSheet.sol";
import "../helpers/BalanceSheet.sol";

/**
* @title MutablePermissionedTokenMock
*
* @dev Should not be instantiated. Use MutablePermissionedTokenMock
* or ImmutablePermissionedTokenMock instead.
*/
contract PermissionedTokenMock is PermissionedToken {
    constructor(address v, address m, address w, address b, address n) public {
        allowances = new AllowanceSheet();
        balances = new BalanceSheet();
        regulator = new Regulator();
        //_setRegulator(address(new Regulator()));
        // regulator.addValidator(this);
        // regulator.addValidator(v);
        // regulator.setMinter(m);
        // regulator.setWhitelistedUser(w);
        // regulator.setBlacklistedUser(b);
        // regulator.setNonlistedUser(n);
    }
}