pragma solidity ^0.4.23;

import "../tokens/permissionedToken/PermissionedToken.sol";


/**
*
* @dev PermissionedTokenLogicFactory creates new PermissionedToken logic contracts. A logic contract implements the 
* functionality of the token, but it must be connected to proper data storage and regulator contracts to execute
* its functions.
*
**/
contract PermissionedTokenLogicFactory {
    // Parameters
    address[] public tokens;

    // Events
    event CreatedPermissionedTokenLogic(address newToken, uint index);

    // Return number of token logic contracts created so far
    function getCount() public view returns (uint) {
        return tokens.length;
    }

    // Return the i'th created token
    function getToken(uint i) public view returns(address) {
        require((i < tokens.length) && (i >= 0), "Invalid index");
        return tokens[i];
    }

    /**
    *
    * @dev generate a new token address that users can cast to a PermissionedToken. The
    * token has no data storage contracts connected to it, so users must call
    * set[Permission]/[Validator]Storage or use it as the implementation address
    * for a PermissionedTokenProxy
    *
    **/
    function createToken() public {
        
        // Store new data storage contracts for token

        address tokenLogic = address(new PermissionedToken(address(0), address(0), address(0)));
        tokens.push(tokenLogic);
        emit CreatedPermissionedTokenLogic(tokenLogic, getCount()-1);
    }
}

