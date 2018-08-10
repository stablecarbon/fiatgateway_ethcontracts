pragma solidity ^0.4.23;

import "../regulator/Regulator.sol";


/**
*
* @dev RegulatorLogicFactory creates new Regulator logic contracts. A logic contract implements the 
* functionality of the Regulator, but it must be connected to proper data storage contracts to execute
* its functions.
*
**/
contract RegulatorLogicFactory {
    // Parameters
    address[] public regulators;

    // Events
    event CreatedRegulatorLogic(address newRegulator, uint index);

    // Return number of regulator logic contracts created so far
    function getCount() public view returns (uint) {
        return regulators.length;
    }

    // Return the i'th created regulator
    function getRegulator(uint i) public view returns(address) {
        require((i < regulators.length) && (i >= 0), "Invalid index");
        return regulators[i];
    }

    /**
    *
    * @dev generate a new regulator address that users can cast to a Regulator. The
    * Regulator has no data storage contracts connected to it, so users must call
    * set[Permission]/[Validator]Storage or use it as the implementation address
    * for a RegulatorProxy
    *
    **/
    function createRegulator() public {
        
        // Store new data storage contracts for regulator

        address regulatorLogic = address(new Regulator(address(0), address(0)));

        regulators.push(regulatorLogic);
        emit CreatedRegulatorLogic(regulatorLogic, getCount()-1);
    }
}
