pragma solidity ^0.4.23;

import "./RegulatorStorage.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
*
* @dev A MutableRegulatorStorage can upgrade its permission and validator sheet location
*
*/
contract MutableRegulatorStorage is Ownable, RegulatorStorage {

    // Events
    event ChangedPermissionStorage(address _old, address _new);
    event ChangedValidatorStorage(address _old, address _new);

    constructor (address permissions, address validators) RegulatorStorage(permissions, validators) public {
    }

    /**
    * @dev Only the MutableRegulatorStorage owner can change its storage location
    * @param _newStorageAddress the new storage address
    */
    function setPermissionStorage(address _newStorageAddress) public onlyOwner {
        require(_newStorageAddress != address(permissions), "Must be a new permission sheet");
        require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
        address old = address(permissions);
        permissions = PermissionSheet(_newStorageAddress);
        emit ChangedPermissionStorage(old, _newStorageAddress);
    }

    function setValidatorStorage(address _newStorageAddress) public onlyOwner {
        require(_newStorageAddress != address(validators), "Must be a new validator sheet");
        require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
        address old = address(validators);
        validators = ValidatorSheet(_newStorageAddress);
        emit ChangedValidatorStorage(old, _newStorageAddress);
    }
}