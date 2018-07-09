pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PermissionsStorage.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the permissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is Ownable {
    /**
    * @notice Stores permission attributes for users. An example use case is an ERC20
    * token that requires its users to go through a KYC/AML check - in this case
    * a validator can set an account's "hasPassedKYC/AML" attribute to 1 to indicate
    * that account can use the token. This mapping stores that value (1, in the
    * example) as well as which validator last set the value and at what time,
    * so that e.g. the check can be renewed at appropriate intervals.
    */
    PermissionsStorage public permissionsStorage;
    mapping (address => mapping(string => bool)) internal permissions;

    /**
    * @notice accounts with ability to set attributes
    *
    */
    mapping (address => bool) validators;

    /**
    * @notice Throws if called by any account that does not have access to set attributes
    *
    */
    modifier onlyValidator() {
        require (validators[msg.sender]);
        _;
    }

    // Events
    event SetPermissionsStorage(address oldStorage, address newStorage);
    event SetUserPermission(address indexed who, string methodsignature);
    event RemoveUserPermission(address indexed who, string methodsignature);
    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    function setPermissionsStorage(address _newStorage) public onlyOwner {
        _oldStorage = address(permissionsStorage);
        permissionsStorage = PermissionStorage(_newStorage);
        emit SetPermissionsStorage(_oldStorage, _newStorage);
    }

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

    function isValidator(address _validator) public view returns (bool) {
        return validators[_validator];
    }
        
    /**
    * @notice Sets a permission for an acccount. Only validators can set a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user is getting permission to run.
    */
    function setPermission(address _who, string _methodsignature) public onlyValidator {
        require(permissionStorage.isPermission(_methodsignature));
        permissions[_who][_permission] = true;
        emit SetPermission(_who, _permission);
    }

    /**
    * @notice Removes an attribute for an acccount. Only validators can remove a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user will no longer be able to execute.
    */
    function removePermission(address _who, string _methodsignature) public onlyValidator {
        require(permissionStorage.isPermission(_methodsignature));
        permissions[_who][_permission] = false;
        emit RemovedPermission(_who, _permission);
    }

    /**
    * @notice Checks whether an account has an attribute 
    * @param _who The address of the account that we are checking the value of an attribute for
    * @param _attribute The attribute (eg. "KYC") in question
    * @return A boolean to determine whether the account has the attribute
    */
    function hasPermission(address _who, string _attribute) public view returns (bool) {
        return attributes[_who][_attribute].value != 0;
    }
}