pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../../../regulator/mocks/RegulatorMock.sol";
import "../helpers/AllowanceSheet.sol";
import "../helpers/BalanceSheet.sol";

/**
* @title MutablePermissionedTokenMock
*
* @dev Should not be instantiated. Use MutablePermissionedTokenMock
* or ImmutablePermissionedTokenMock instead.
*/
contract PermissionedTokenMock is PermissionedToken {
    constructor(address asheet, address bsheet, address v, address m, address w, address b, address n) public {
        allowances = AllowanceSheet(asheet);
        balances = BalanceSheet(bsheet);
        RegulatorMock r = new RegulatorMock(v, m, w, b, n);
        setRP(r);
    }
}