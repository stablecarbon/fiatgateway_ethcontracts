pragma solidity ^0.4.23;

import "../Regulator.sol";

contract RegulatorMock is Regulator {
    /** 
        @dev Creates permissions for all functions in WhitelistedToken.
     */
    constructor(address regulatorStorage) public {

        setStorage(regulatorStorage);

    }

}