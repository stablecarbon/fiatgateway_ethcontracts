pragma solidity ^0.4.23;

import "../helpers/ValidatorStorage.sol";

contract ValidatorStorageMock is ValidatorStorage {
    /** 
        @dev Creates a validator.
     */
    constructor(address validator) ValidatorStorage() public {
        addValidator(validator);
    }
}