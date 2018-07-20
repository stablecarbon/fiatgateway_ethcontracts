pragma solidity ^0.4.23;

import "../../permissionedToken/immutablePermissionedToken/mocks/ImmutablePermissionedTokenMock.sol";
import "../WhitelistedToken.sol";

/**
* @title WhitelistedTokenMock
*/
contract WhitelistedTokenMock is ImmutablePermissionedTokenMock, WhitelistedToken {
    constructor(address v, address m, address b, address w, address n, address cusd) 
        ImmutablePermissionedTokenMock(v, m, b, w, n) WhitelistedToken(cusd) public {}
}