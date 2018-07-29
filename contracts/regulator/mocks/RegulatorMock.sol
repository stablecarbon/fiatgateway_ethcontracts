pragma solidity ^0.4.23;

import "../dataStorage/RegulatorStorageConsumer.sol";
import "../Regulator.sol";

/**
*
* @dev creates a Regulator connected to an empty RegulatorStorage
*
*/
contract RegulatorMock is Regulator, RegulatorStorageConsumer {


	constructor (address regulatorStorage) RegulatorStorageConsumer(regulatorStorage) public {

	}
}