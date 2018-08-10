pragma solidity ^0.4.23;

import "../regulator/dataStorage/ValidatorSheet.sol";

/**
*
* @dev ValidatorSheetMockFactory creates new ValidatorSheet contracts instantiated with data stores. 
*
**/
contract ValidatorSheetFactory {
    // Parameters
    address[] public validatorSheets;

    // Events
    event CreatedValidatorSheet(address newValidatorSheet, uint index);

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint) {
        return validatorSheets.length;
    }

    // Return the i'th created token
    function getValidatorSheet(uint i) public view returns(address) {
        require((i < validatorSheets.length) && (i >= 0), "Invalid index");
        return validatorSheets[i];
    }

    /**
    *
    * @dev Generate new validator sheet.
    *
    **/
    function createValidatorSheet() public {
        // Store new data storage contracts for token proxy
        address validatorSheet = address(new ValidatorSheet()); 
        validatorSheets.push(validatorSheet);
        emit CreatedValidatorSheet(validatorSheet, validatorSheets.length - 1);
    }
}
