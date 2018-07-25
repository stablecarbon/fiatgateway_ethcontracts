pragma solidity ^0.4.23;

import "../ValidatorStorage.sol";

contract ValidatorStorageMock is ValidatorStorage {
    /** 
        @dev Creates a validator.
     */
    constructor(address validator) public {
<<<<<<< HEAD
        _addValidator(validator);
=======
        addValidator(validator);
>>>>>>> pai_v0
    }
}