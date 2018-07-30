pragma solidity ^0.4.23;

import "../dataStorage/MutableRegulatorStorageConsumer.sol";
import "../Regulator.sol";

/**
*
* @dev creates a RegulatorMock that has the ability to upgrade its RegulatorStorage
*
*/
contract MutableStorageRegulatorMock is Regulator, MutableRegulatorStorageConsumer {

	constructor (address permissions, address validators) MutableRegulatorStorageConsumer(permissions, validators) public {
		
	}
}