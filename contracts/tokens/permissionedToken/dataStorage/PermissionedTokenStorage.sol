pragma solidity ^0.4.23;


import "./AllowanceSheet.sol";
import "./BalanceSheet.sol";
import "../../../regulator/Regulator.sol";

/**
* @title PermissionedTokenStorage
* @notice a PermissionedTokenStorage is constructed by setting Regulator, BalanceSheet, and AllowanceSheet locations.
* Once the storages are set, they cannot be changed.
*/
contract PermissionedTokenStorage {
    /**
        Storage
    */
    Regulator public regulator;
    BalanceSheet public balances;
    AllowanceSheet public allowances;

    /**
    * @dev a PermissionedTokenStorageConsumer can set its storages only once, on construction
    *
    **/
    constructor (address _regulator, address _balances, address _allowances) public {
        regulator = Regulator(_regulator);
        balances = BalanceSheet(_balances);
        allowances = AllowanceSheet(_allowances);
    }
}