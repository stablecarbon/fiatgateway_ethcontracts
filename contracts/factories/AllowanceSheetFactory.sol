pragma solidity ^0.4.23;

import "../tokens/permissionedToken/dataStorage/AllowanceSheet.sol";

/**
*
* @dev AllowanceSheetFactory creates new AllowanceSheet contracts instantiated with data stores. 
*
**/
contract AllowanceSheetFactory {
    // Parameters
    address[] public allowanceSheets;

    // Events
    event CreatedAllowanceSheet(address newAllowanceSheet, uint index);

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint) {
        return allowanceSheets.length;
    }

    // Return the i'th created token
    function getAllowanceSheet(uint i) public view returns(address) {
        require((i < allowanceSheets.length) && (i >= 0), "Invalid index");
        return allowanceSheets[i];
    }

    /**
    *
    * @dev Generate new allowance sheet.
    *
    **/
    function createAllowanceSheet() public {
        // Store new data storage contracts for token proxy
        address allowanceSheet = address(new AllowanceSheet()); 
        allowanceSheets.push(allowanceSheet);
        emit CreatedAllowanceSheet(allowanceSheet, allowanceSheets.length - 1);
    }
}
