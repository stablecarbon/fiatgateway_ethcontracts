pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../helpers/AllowanceSheet.sol";
import "../helpers/BalanceSheet.sol";

/**
* @title MutablePermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator
*
* This token is upgradeable, in contrast with ImmutablePermissionedToken.
*
* Current responsibilities: 
* 	Anyone can transfer 
*	Owner can mint, destroy blacklisted tokens
*	Depositors can burn
*/
contract MutablePermissionedToken is PermissionedToken {
    // Permissioned-Token specific
    event BalanceSheetChanged(address indexed oldSheet, address indexed newSheet);
    event AllowanceSheetChanged(address indexed oldSheet, address indexed newSheet);

    /* Constructor */
    constructor(address a, address b) PermissionedToken(a,b) public  {

    }

    /**
    * @dev Claim ownership of the AllowanceSheet contract
    * @param _sheet The address to of the AllowanceSheet to claim.
    */
    function setAllowanceSheet(address _sheet) public onlyOwner returns(bool){
        address oldAllowances = address(allowances);
        allowances = AllowanceSheet(_sheet);
        emit AllowanceSheetChanged(oldAllowances, _sheet);
        return true;
    }

    /**
    * @dev Claim ownership of the BalanceSheet contract
    * @param _sheet The address to of the BalanceSheet to claim.
    */
    function setBalanceSheet(address _sheet) public onlyOwner returns(bool){
        address oldBalances = address(balances);
        balances = BalanceSheet(_sheet);
        emit BalanceSheetChanged(oldBalances, _sheet);
        return true;
    }
}