pragma solidity ^0.4.24;

import "../tokens/whitelistedToken/WhitelistedTokenProxy.sol";
import "../tokens/permissionedToken/dataStorage/BalanceSheet.sol";
import "../tokens/permissionedToken/dataStorage/AllowanceSheet.sol";
import "../tokens/whitelistedToken/WhitelistedToken.sol";

/**
*
* @dev WhitelistedTokenProxyFactory creates new WhitelistedTokenProxy contracts with new data storage sheets, properly configured
* with ownership, and the proxy logic implementations are based on a user-specified WhitelistedTokenProxy. 
*
**/
contract WhitelistedTokenProxyFactory {
    // Parameters
    address[] public tokens;

    // Events
    event CreatedWhitelistedTokenProxy(address newToken, uint256 index);

    /**
    *
    * @dev generate a new proxy address that users can cast to a PermissionedToken or PermissionedTokenProxy. The
    * proxy has empty data storage contracts connected to it and it is set with an initial logic contract
    * to which it will delegate functionality
    * @param regulator the address of the initial regulator contract that regulates the proxy
    * @param tokenImplementation the address of the initial PT token implementation
    *
    **/
    function createToken(address tokenImplementation, address cusdAddress, address regulator) public {
        
        // Store new data storage contracts for token proxy
        address balances = address(new BalanceSheet()); 
        address allowances = address(new AllowanceSheet());

        address proxy = address(new WhitelistedTokenProxy(tokenImplementation, regulator, balances, allowances, cusdAddress));

        // data storages should ultimately point be owned by the proxy, since it will delegate function
        // calls to the latest implementation *in the context of the proxy contract*
        BalanceSheet(balances).transferOwnership(address(proxy));
        AllowanceSheet(allowances).transferOwnership(address(proxy));
        WhitelistedToken(proxy).claimBalanceOwnership();
        WhitelistedToken(proxy).claimAllowanceOwnership();

        // The function caller should own the proxy contract
        WhitelistedTokenProxy(proxy).transferOwnership(msg.sender);

        tokens.push(proxy);
        emit CreatedWhitelistedTokenProxy(proxy, getCount()-1);
    }

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint256) {
        return tokens.length;
    }

    // Return the i'th created token
    function getToken(uint256 i) public view returns(address) {
        require((i < tokens.length) && (i >= 0), "Invalid index");
        return tokens[i];
    }
}

