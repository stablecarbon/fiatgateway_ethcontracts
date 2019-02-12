pragma solidity ^0.4.24;

import "../tokens/permissionedToken/PermissionedTokenProxy.sol";

/**
*
* @dev PermissionedTokenProxyFactory creates new PermissionedTokenProxy contracts with new data storage sheets, properly configured
* with ownership, and the proxy logic implementations are based on a user-specified PermissionedToken. 
*
**/
contract PermissionedTokenProxyFactory {
    address[] public tokens;

    // Events
    event CreatedPermissionedTokenProxy(address newToken, uint256 index);
    
    /**
    *
    * @dev generate a new proxy contract that users can cast to a PermissionedToken or PermissionedTokenProxy. The
    * proxy has empty data storage contracts connected to it and it is set with an initial logic contract
    * to which it will delegate functionality
    * @param regulator the address of the initial regulator contract that regulates the proxy
    * @param tokenImplementation the address of the initial PT token implementation
    *
    **/
    function createToken(address tokenImplementation, address regulator) public {
        
        address proxy = address(new PermissionedTokenProxy(tokenImplementation, regulator));

        // The function caller should own the proxy contract
        // @dev: the function caller must call claimOwnership() to complete the ownership transfer
        PermissionedTokenProxy(proxy).transferOwnership(msg.sender);

        tokens.push(proxy);
        emit CreatedPermissionedTokenProxy(proxy, getCount()-1);
    }

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint256) {
        return tokens.length;
    }

    // Return the i'th created token
    function getToken(uint i) public view returns(address) {
        require((i < tokens.length) && (i >= 0), "Invalid index");
        return tokens[i];
    }
}

