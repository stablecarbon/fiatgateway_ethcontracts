pragma solidity ^0.4.23;

import "../tokens/carbonToken/CarbonDollarProxy.sol";
import "../tokens/carbonToken/dataStorage/FeeSheet.sol";
import "../tokens/carbonToken/dataStorage/StablecoinWhitelist.sol";
import "../tokens/permissionedToken/dataStorage/BalanceSheet.sol";
import "../tokens/permissionedToken/dataStorage/AllowanceSheet.sol";

/**
*
* @dev PermissionedTokenProxyFactory creates new PermissionedTokenProxy contracts instantiated with data stores. 
*
**/
contract CarbonDollarProxyFactory {
    // Parameters
    address[] public tokens;

    // Events
    event CreatedCarbonDollarProxy(address newToken, uint index);

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
        
        // Store new data storage contracts for token proxy
        address balances = address(new BalanceSheet()); 
        address allowances = address(new AllowanceSheet());
        address fees = address(new FeeSheet());
        address whitelist = address(new StablecoinWhitelist());

        address proxy = address(new CarbonDollarProxy(tokenImplementation, regulator, balances, allowances, fees, whitelist));

        // data storages should ultimately point be owned by the proxy, since it will delegate function
        // calls to the latest implementation *in the context of the proxy contract*
        BalanceSheet(balances).transferOwnership(address(proxy));
        AllowanceSheet(allowances).transferOwnership(address(proxy));
        FeeSheet(fees).transferOwnership(address(proxy));
        StablecoinWhitelist(whitelist).transferOwnership(address(proxy));

        // The function caller should own the proxy contract
        CarbonDollarProxy(proxy).transferOwnership(msg.sender);

        tokens.push(proxy);
        emit CreatedCarbonDollarProxy(proxy, getCount()-1);
    }
}

