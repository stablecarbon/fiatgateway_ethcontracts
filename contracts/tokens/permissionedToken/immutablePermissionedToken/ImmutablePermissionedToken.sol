pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../helpers/AllowanceSheet.sol";
import "../helpers/BalanceSheet.sol";

/**
* @title PermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator.
*
* @dev This token is not meant to be instantiated. Instantiate the derived contracts
* `ImmutablePermissionedToken` or `MutablePermissionedToken` instead.
*
*/
contract ImmutablePermissionedToken is PermissionedToken {
    /** CONSTRUCTOR
        @notice Sets allowance and balance sheets for contract.
    **/
    constructor(address a, address b) public {
        allowances = AllowanceSheet(a);
        balances = BalanceSheet(b);
    }
}