pragma solidity ^0.4.24;

import "../permissionedToken/PermissionedTokenProxy.sol";

/**
* @title WhitelistedTokenProxy
* @notice This contract IS a WhitelistedToken. All calls to the WhitelistedToken contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract WhitelistedTokenProxy is PermissionedTokenProxy {
    address public cusdAddress;


    constructor(address _implementation, 
                address _regulator, 
                address _cusd) public PermissionedTokenProxy(_implementation, _regulator) {
        // base class override
        regulator = Regulator(_regulator);

        cusdAddress = _cusd;

    }
}