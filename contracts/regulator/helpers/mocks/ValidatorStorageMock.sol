pragma solidity ^0.4.23;

import "../ValidatorStorage.sol";

contract ValidatorStorageMock is ValidatorStorage {
    /** 
        @dev Creates a validator.
     */
    constructor(address validator) public {
        addValidator(validator);
    }
}