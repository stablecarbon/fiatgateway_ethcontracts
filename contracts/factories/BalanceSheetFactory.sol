pragma solidity ^0.4.23;

import "../tokens/permissionedToken/dataStorage/BalanceSheet.sol";

/**
*
* @dev BalanceSheetFactory creates new BalanceSheet contracts instantiated with data stores. 
*
**/
contract BalanceSheetFactory {
    // Parameters
    address[] public balanceSheets;

    // Events
    event CreatedBalanceSheet(address newBalanceSheet, uint index);

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint) {
        return balanceSheets.length;
    }

    // Return the i'th created token
    function getBalanceSheet(uint i) public view returns(address) {
        require((i < balanceSheets.length) && (i >= 0), "Invalid index");
        return balanceSheets[i];
    }

    /**
    *
    * @dev Generate new balance sheet.
    *
    **/
    function createBalanceSheet() public {
        // Store new data storage contracts for token proxy
        address balanceSheet = address(new BalanceSheet()); 
        balanceSheets.push(balanceSheet);
        emit CreatedBalanceSheet(balanceSheet, balanceSheets.length - 1);
    }
}
