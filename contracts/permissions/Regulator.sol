pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PermissionStorage.sol";
import "./UserPermissionsStorage.sol";
import "./ValidatorStorage.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is Ownable {
    /** 
    * @notice Stores a mapping from method signatures to permission attributes (e.g. whether
      the permission is "activated" for use, and additional attributes such as the
      method's name and location in the code.)
    */
    PermissionStorage public availablePermissions;

    /** 
    * @notice Stores a mapping from users to execution permissions that they hold.
    */
    UserPermissionsStorage public userPermissions;

    /**
    * @notice accounts with ability to set attributes
    *
    */
    ValidatorStorage validators;

    /**
    * @notice Throws if called by any account that does not have access to set attributes
    *
    */
    modifier onlyValidator() {
        require (validators.isValidator(msg.sender));
        _;
    }

    // Events
    event SetPermissionStorage(address oldStorage, address newStorage);
    function setPermissionStorage(address _newStorage) public onlyOwner {
        _oldStorage = address(availablePermissions);
        availablePermissions = PermissionStorage(_newStorage);
        emit SetPermissionsStorage(_oldStorage, _newStorage);
    }
        
    /**
    * @notice Sets a permission for an acccount. Only validators can set a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user is getting permission to run.
    */
    function setPermission(address _who, string _methodsignature) public onlyValidator {
        require(availablePermissions.isPermission(_methodsignature));
        userPermissions.setPermission(_who, _permission);
    }

    /**
    * @notice Removes a permission for an acccount. Only validators can remove a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user will no longer be able to execute.
    */
    function removePermission(address _who, string _methodsignature) public onlyValidator {
        require(availablePermissions.isPermission(_methodsignature));
        userPermissions.removePermission(_who, _permission);
    }

    /**
    * @notice Checks whether an account has the permission to execute a function
    * @param _who The address of the account
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the user has permission or not
    */
    function hasPermission(address _who, string _methodsignature) public view returns (bool) {
        return userPermissions.getPermission(_who, _methodsignature);
    }
}