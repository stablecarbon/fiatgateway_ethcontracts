pragma solidity ^0.4.23;

import "../ImmutablePermissionedToken.sol";
import "../../mocks/PermissionedTokenMock.sol";

/**
* @title ImmutablePermissionedTokenMock
*/
contract ImmutablePermissionedTokenMock is PermissionedTokenMock, ImmutablePermissionedToken {
    constructor(address v, address m, address b, address w, address n) 
        PermissionedTokenMock(v, m, b, w, n) public {}
}