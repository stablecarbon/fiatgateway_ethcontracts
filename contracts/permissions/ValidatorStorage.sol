pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

contract ValidatorStorage is Claimable {
    mapping (address => bool) internal validators;

    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);
    
    /**
    * @notice add a Validator
    * @param _validator Address of validator to add
    */
    function addValidator(address _validator) public onlyOwner {
        validators[_validator] = true;
        emit ValidatorAdded(_validator);
    }

    /**
    * @notice remove a Validator
    * @param _validator Address of validator to remove
    */
    function removeValidator(address _validator) public onlyOwner {
        validators[_validator] = false;
        emit ValidatorRemoved(_validator);
    }

    /**
    * @notice Check if a given address is a validator
    * @param _validator Address of validator to check
    * @return `true` if address is the address of a validator, `false` otherwise
    */
    function isValidator(address _validator) public view returns (bool) {
        return validators[_validator];
    }
}