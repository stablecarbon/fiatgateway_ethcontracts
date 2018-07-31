pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title ValidatorSheet
 * @dev Stores all validators capable of adding permissions and setting user permissions
 *
 */
contract ValidatorSheet is Ownable{
	
    /** 
        Mappings 
    */

    // (user address => is user a validator?)
    mapping (address => bool) public isValidator;

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    /**
    * @notice add a Validator
    * @param _validator Address of validator to add
    */
    function addValidator(address _validator) onlyOwner public {
        _addValidator(_validator);
    }
    
    function _addValidator(address _validator) internal {
        isValidator[_validator] = true;
        emit ValidatorAdded(_validator);
    }

    /**
    * @notice remove a Validator
    * @param _validator Address of validator to remove
    */
    function removeValidator(address _validator) onlyOwner public {
        isValidator[_validator] = false;
        emit ValidatorRemoved(_validator);
    }

}