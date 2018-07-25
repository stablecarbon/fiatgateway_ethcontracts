pragma solidity ^0.4.23;

import "../MutablePermissionedToken.sol";
import "../../mocks/PermissionedTokenMock.sol";

/**
* @title MutablePermissionedTokenMock
*/
contract MutablePermissionedTokenMock is MutablePermissionedToken, PermissionedTokenMock {
    constructor(address asheet,
                address bsheet,
                address v,
                address m,
                address b,
                address w, 
                address n)
        MutablePermissionedToken(asheet, bsheet) PermissionedTokenMock(v, m, b, w, n) public {}
}