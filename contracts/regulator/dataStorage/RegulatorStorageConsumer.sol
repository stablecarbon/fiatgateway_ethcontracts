pragma solidity ^0.4.23;

import "./RegulatorStorage.sol";
import "./RegulatorStorageState.sol";


/**
*
* @dev a RegulatorStorageConsumer is constructed by setting a RegulatorStorage location
*
*/
contract RegulatorStorageConsumer is RegulatorStorageState {


    /**
    * @dev a RegulatorStorageConsumer can set its storage only once, on construction
    *
    **/
    constructor (address regulatorStorage) public {
    	_storage = RegulatorStorage(regulatorStorage);
    }

}