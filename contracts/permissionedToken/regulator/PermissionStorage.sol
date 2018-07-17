pragma solidity ^0.4.23;

import '../../eternalStorage/EternalStorage.sol';
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

contract PermissionStorage is EternalStorage, Claimable {
	/** 
        Mappings 
    */
    /** Key is a method signature, value is a Permission struct, 
    which contains a description for the permission. **/
    mapping (bytes4 => Permission) public permissions;
    /** Tracks whether or not a method signature is associated
    with an actual permission. **/
    mapping (bytes4 => bool) public isPermission;

    /** 
        Structs 
    */
    /** Contains metadata about a permission to execute a particular method signature. */
    struct Permission {
        string name; // A one-word description for the permission. e.g. "canMint"
        string description; // A longer description for the permission. e.g. "Allows user to mint tokens."
        string contract_name; // e.g. "PermissionedToken"
    }

    /** 
        Events 
    */
    event PermissionAdded(bytes4 methodsignature);
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
        Permission memory p = Permission(_permissionName, _permissionDescription, _contractName);
        addPermission(_methodsignature, p);
    }

     /**
    * @notice Sets a permission within the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    * @param _permission A struct containing permission information.
    */
    function addPermission(
        bytes4 _methodsignature, 
        Permission _permission) internal {
        permissions[_methodsignature] = _permission;
        isPermission[_methodsignature] = true;
        emit PermissionAdded(_methodsignature);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) external onlyOwner {
        isPermission[_methodsignature] = false;
        emit PermissionRemoved(_methodsignature);
    }
}