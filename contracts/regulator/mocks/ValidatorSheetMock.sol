pragma solidity ^0.4.23;

import "../dataStorage/ValidatorSheet.sol";

/**
*
* @dev creates a Validator with a single validator set
*
*/
contract ValidatorSheetMock is ValidatorSheet {
    /** 
        @dev Initializes a validator
     */
    constructor(address validator)  public {
        addValidator(validator);
    }
}