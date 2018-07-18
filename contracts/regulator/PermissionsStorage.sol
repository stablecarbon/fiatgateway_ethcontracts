pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

// TODO make compliant with eternalstorage

contract PermissionsStorage is Claimable {
	/** 
        Mappings 
    */
    // method signature => Permission struct containing details about that permission
    mapping (bytes4 => Permission) public permissions;
    // method signature => is this signature used as a permission?
    mapping (bytes4 => bool) public isPermission;
    // (user address => (methodsignature => does user have permission to execute it?))
    mapping (address => mapping(bytes4 => bool)) public hasUserPermission;

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
    event SetUserPermission(address indexed who, bytes4 methodsignature);
    event RemovedUserPermission(address indexed who, bytes4 methodsignature);

    /** 
        Constants: stores method signatures 
    */
    bytes4 public MINT_SIG = bytes4(keccak256("mint(address,uint256)"));
    bytes4 public MINT_CUSD_SIG = bytes4(keccak256("mint(address,uint256,bool)"));
    bytes4 public BURN_SIG = bytes4(keccak256("burn(uint256)"));
    bytes4 public TRANSFER_SIG = bytes4(keccak256("transfer(address,uint256)"));
    bytes4 public TRANSFER_FROM_SIG = bytes4(keccak256("transferFrom(address,address,uint256)"));
    bytes4 public DESTROY_BLACKLISTED_TOKENS_SIG = bytes4(keccak256("destroyBlacklistedTokens(address)"));
    bytes4 public ADD_BLACKLISTED_ADDRESS_SPENDER_SIG = bytes4(keccak256("addBlacklistedAddressSpender(address)"));
    bytes4 public BLACKLISTED_SIG = bytes4(keccak256("blacklisted()"));

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
    
    /**
    * @notice Sets a permission in the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function setUserPermission(address _who, bytes4 _methodsignature) public onlyOwner {
        require(isPermission[_methodsignature]);
        hasUserPermission[_who][_methodsignature] = true;
        emit SetUserPermission(_who, _methodsignature);
    }

    /**
    * @notice Removes a permission from the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removeUserPermission(address _who, bytes4 _methodsignature) public onlyOwner {
        require(isPermission[_methodsignature]);
        hasUserPermission[_who][_methodsignature] = false;
        emit RemovedUserPermission(_who, _methodsignature);
    }
}