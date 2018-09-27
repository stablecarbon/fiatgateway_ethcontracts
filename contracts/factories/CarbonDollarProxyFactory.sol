pragma solidity ^0.4.24;

import "../tokens/carbonToken/CarbonDollarProxy.sol";

/**
*
* @dev CarbonDollarProxyFactory creates new CarbonDollarProxy contracts with new data storage sheets, properly configured
* with ownership, and the proxy logic implementations are based on a user-specified CarbonDollar. 
*
**/
contract CarbonDollarProxyFactory {
    // Parameters
    address[] public tokens;

    // Events
    event CreatedCarbonDollarProxy(address newToken, uint256 index);
    
    /**
    *
    * @dev generate a new proxy address that users can cast to a PermissionedToken or PermissionedTokenProxy. The
    * proxy has empty data storage contracts connected to it and it is set with an initial logic contract
    * to which it will delegate functionality
    * @param regulator the address of the initial regulator contract that regulates the proxy
    * @param tokenImplementation the address of the initial PT token implementation
    *
    **/
    function createToken(address tokenImplementation, address regulator) public {
        
        address proxy = address(new CarbonDollarProxy(tokenImplementation, regulator));

        // The function caller should own the proxy contract
        CarbonDollarProxy(proxy).transferOwnership(msg.sender);

        tokens.push(proxy);
        emit CreatedCarbonDollarProxy(proxy, getCount()-1);
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

