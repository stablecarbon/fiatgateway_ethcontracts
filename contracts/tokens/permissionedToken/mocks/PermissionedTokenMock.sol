pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../../../regulator/mocks/RegulatorMock.sol";

/**
* @title MutablePermissionedTokenMock
*
* @dev Should not be instantiated. Use MutablePermissionedTokenMock
* or ImmutablePermissionedTokenMock instead.
*/
contract PermissionedTokenMock is PermissionedToken {
    constructor(address v, address m, address w, address b, address n) internal {
        RegulatorMock r = new RegulatorMock(v, m, w, b, n);
        setRP(r);
    }
}