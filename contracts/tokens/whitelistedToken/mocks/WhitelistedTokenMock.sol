pragma solidity ^0.4.23;

import "../../permissionedToken/mocks/PermissionedTokenMock.sol";
import "../WhitelistedToken.sol";

/**
* @title WhitelistedTokenMock
*/
contract WhitelistedTokenMock is PermissionedTokenMock, WhitelistedToken {
    constructor(address asheet, 
                address bsheet, 
                address v, 
                address m, 
                address b, 
                address w, 
                address n, 
                address cusd) 
        PermissionedTokenMock(asheet, bsheet, v, m, b, w, n) WhitelistedToken(cusd) public {}
}