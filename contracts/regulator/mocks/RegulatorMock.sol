pragma solidity ^0.4.23;

import "../dataStorage/RegulatorStorageConsumer.sol";
import "../Regulator.sol";

/**
*
* @dev creates a Regulator connected to an empty RegulatorStorage
*
*/
contract RegulatorMock is Regulator, RegulatorStorageConsumer {


	constructor (address permissions, address validators) RegulatorStorageConsumer(permissions, validators) public {

	}
}