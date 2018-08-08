pragma solidity ^0.4.23;

import '../regulator/Regulator.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
*
* @dev RegulatorLogicFactory creates new Regulator logic contracts 
*
**/
contract RegulatorLogicFactory is Ownable {

	// Parameters
	address[] public regulators;

	// Events
	event CreatedRegulatorLogic(address newRegulator, uint index);

	function getCount() public view returns (uint) {
		return regulators.length;
	}

	/**
	*
	* @dev generate a new regulator address that users can cast to either a RegulatorProxy or a Regulator.
	* The Regulator has the same logic as the regulatorImplementation input contract.
	*
	**/
	function createRegulator() onlyOwner public {
		
		// Store new data storage contracts for regulator

		address regulatorLogic = address(new Regulator(address(0), address(0)));

		regulators.push(regulatorLogic);
		emit CreatedRegulatorLogic(regulatorLogic, getCount()-1);
	}

}

