pragma solidity ^0.4.24;

/**
* @title WhitelistedTokenStorage
* @notice Contains necessary storage contracts for WhitelistedToken.
*/
contract WhitelistedTokenStorage{
    /**
        Storage
    */
    address public cusdAddress;

    /**
    * @dev a WhitelistedTokenStorage can set its storages only once, on construction
    *
    **/
    constructor (address _cusdAddress) public {
        cusdAddress = _cusdAddress;
    }
}