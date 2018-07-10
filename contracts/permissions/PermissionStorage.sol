pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

/**
* @notice Storage contract for list of permissions that a Regulator can set on users.
*/
contract PermissionsStorage is Claimable {
    mapping (string => Permission) permissions; // Key is a method signature, value is a Permission struct, which contains
                                                // a description for the permission
    mapping (string => bool) isPermissionSet; // True if permission[key] is set, false otherwise.

    struct Permission {
        string name; // A one-word description for the permission. e.g. "canMint"
        string description; // A longer description for the permission. e.g. "Allows user to mint tokens."
        string contract_name; // e.g. "PermissionedToken"
    }

    event PermissionSet(string permissionName, string methodsignature);
    event PermissionRemoved(string permissionName, string methodsignature);

    /**
    * @notice Sets a permission within the list of permissions.
    * @param methodsignature Signature of the method that this permission controls.
    * @param permissionName A "slug" name for this permission (e.g. "canMint").
    * @param permissionDescription A lengthier description for this permission (e.g. "Allows user to mint tokens").
    * @param contractName Name of the contract that the method belongs to.
    */
    function addPermission(
        string methodsignature, 
        string permissionName, 
        string permissionDescription, 
        string contractName) 
    onlyAdmin public {
        permissions[methodsignature] = Permission(permissionName, permissionDescription, contractName);
        isPermissionSet[methodsignature] = true;
        emit PermissionSet(methodsignature);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param methodsignature Signature of the method that this permission controls.
    */
    function removePermission(string methodsignature) onlyAdmin public {
        isPermissionSet[methodsignature] = false;
        emit PermissionRemoved(permission);
    }

    /**
    * @notice Checks if a permission exists within the list of permissions.
    * @param methodsignature Signature of the method that this permission controls.
    * @return True if the permission data is set for the provided method signature, otherwise false.
    */
    function isPermission(string methodsignature) public view returns (bool) {
        return isPermissionSet[methodsignature];
    }
}