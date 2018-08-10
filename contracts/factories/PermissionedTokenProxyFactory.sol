pragma solidity ^0.4.23;

import "../tokens/permissionedToken/PermissionedTokenProxy.sol";
import "../tokens/permissionedToken/dataStorage/BalanceSheet.sol";
import "../tokens/permissionedToken/dataStorage/AllowanceSheet.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";


/**
*
* @dev PermissionedTokenProxyFactory creates new PermissionedTokenProxy contracts instantiated with data stores. 
*
**/
contract PermissionedTokenProxyFactory {
    // Parameters
    address[] public tokens;

    // Events
    event CreatedPermissionedTokenProxy(address newToken, uint index);

    // Return number of token proxy contracts created so far
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
    * @dev generate a new proxy address that users can cast to a PermissionedToken or PermissionedTokenProxy. The
    * proxy has empty data storage contracts connected to it and it is set with an initial logic contract
    * to which it will delegate functionality
    * @param regulator the address of the initial regulator contract that regulates the proxy
    * @param tokenImplementation the address of the initial PT token implementation
    *
    **/
    function createToken(address tokenImplementation, address regulator) public {
        require(AddressUtils.isContract(regulator), "Cannot set regulator to a non-contract address");
        require(AddressUtils.isContract(tokenImplementation), "Cannot set a proxy implementation to a non-contract address");

        // Store new data storage contracts for token proxy
        address balances = address(new BalanceSheet()); 
        address allowances = address(new AllowanceSheet());

        address proxy = address(new PermissionedTokenProxy(tokenImplementation, regulator, balances, allowances));

        // data storages should ultimately point be owned by the proxy, since it will delegate function
        // calls to the latest implementation *in the context of the proxy contract*
        BalanceSheet(balances).transferOwnership(address(proxy));
        AllowanceSheet(allowances).transferOwnership(address(proxy));

        // The function caller should own the proxy contract
        PermissionedTokenProxy(proxy).transferOwnership(msg.sender);

        tokens.push(proxy);
        emit CreatedPermissionedTokenProxy(proxy, getCount()-1);
    }
}

