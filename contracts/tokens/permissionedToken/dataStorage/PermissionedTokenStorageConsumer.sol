pragma solidity ^0.4.23;

import "./PermissionedTokenStorageState.sol";


/**
*
* @dev a PermissionedTokenStorageConsumer is constructed by setting Regulator, BalanceSheet, and AllowanceSheet locations
*
*/
contract PermissionedTokenStorageConsumer is PermissionedTokenStorageState {


    /**
    * @dev a PermissionedTokenStorageConsumer can set its storages only once, on construction
    *
    **/
    constructor (address regulator, address balances, address allowances) public {
    	_regulator = Regulator(regulator);
    	_balances = BalanceSheet(balances);
    	_allowances = AllowanceSheet(allowances);
    }

}