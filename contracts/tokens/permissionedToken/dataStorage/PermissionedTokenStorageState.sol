pragma solidity ^0.4.23;

import "./AllowanceSheet.sol";
import "./BalanceSheet.sol";
import "../../../regulator/Regulator.sol";

/**
*
* @dev contains a Regulator, BalanceSheet and AllowanceSheet
*
*/
contract PermissionedTokenStorageState {

	/**
    	Storage
    */
    Regulator public _regulator;
    BalanceSheet public _balances;
    AllowanceSheet public _allowances;


}