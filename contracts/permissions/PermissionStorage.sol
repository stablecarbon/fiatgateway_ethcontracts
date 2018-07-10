pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

/**
* @notice Storage contract for list of permissions that a Regulator can set on users.
*/
contract PermissionStorage is Claimable {
    mapping (bytes4 => Permission) permissions; // Key is a method signature, value is a Permission struct, which contains
                                                // a description for the permission
    mapping (bytes4 => bool) isPermissionSet; // True if permission[key] is set, false otherwise.

    struct Permission {
        string name; // A one-word description for the permission. e.g. "canMint"
        string description; // A longer description for the permission. e.g. "Allows user to mint tokens."
        string contract_name; // e.g. "PermissionedToken"
    }

    event PermissionSet(bytes4 methodsignature);
    event PermissionRemoved(bytes4 methodsignature);

    /**
    * @notice Sets a permission within the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    * @param _permissionName A "slug" name for this permission (e.g. "canMint").
    * @param _permissionDescription A lengthier description for this permission (e.g. "Allows user to mint tokens").
    * @param _contractName Name of the contract that the method belongs to.
    */
    function addPermission(
        bytes4 _methodsignature, 
        string _permissionName, 
        string _permissionDescription, 
        string _contractName) 
    onlyOwner public {
        permissions[_methodsignature] = Permission(_permissionName, _permissionDescription, _contractName);
        isPermissionSet[_methodsignature] = true;
        emit PermissionSet(_methodsignature);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) onlyOwner public {
        isPermissionSet[_methodsignature] = false;
        emit PermissionRemoved(_methodsignature);
    }

    /**
    * @notice Checks if a permission exists within the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    * @return True if the permission data is set for the provided method signature, otherwise false.
    */
    function isPermission(bytes4 _methodsignature) public view returns (bool) {
        return isPermissionSet[_methodsignature];
    }
}