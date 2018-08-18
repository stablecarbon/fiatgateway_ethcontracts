pragma solidity ^0.4.24;

import '../../helpers/Ownable.sol';
/**
 * @title PermissionSheet
 * @dev Stores all of the possible token-level permissions that a user can have access to. For example,
 * a user can potentially burn or mint a token. Also maps the permissions
 * to each user.
 *
 */

contract PermissionSheet is Ownable {
	
    /** 
        Mappings 
    */

    /* method signature => Permission struct containing details about that permission */
    mapping (bytes4 => Permission) public permissions;
    /* method signature => is this signature currently used as a permission? */
    mapping (bytes4 => bool) public isPermission;
    /* (user address => (methodsignature => does user have permission to execute it?)) */
    mapping (address => mapping(bytes4 => bool)) public hasUserPermission;

    /** 
        Structs 
    */

    /* Contains metadata about a permission to execute a particular method signature. */
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
        Constants: stores method signatures. These are potential permissions that a user can have, 
        and each permission gives the user the ability to call the associated PermissionedToken method signature
    */
    bytes4 public constant MINT_SIG = bytes4(keccak256("mint(address,uint256)"));
    bytes4 public constant MINT_CUSD_SIG = bytes4(keccak256("mintCUSD(address,uint256)"));
    bytes4 public constant CONVERT_WT_SIG = bytes4(keccak256("convertWT(uint256)"));
    bytes4 public constant BURN_SIG = bytes4(keccak256("burn(uint256)"));
    bytes4 public constant CONVERT_CARBON_DOLLAR_SIG = bytes4(keccak256("convertCarbonDollar(address,uint256)"));
    bytes4 public constant BURN_CARBON_DOLLAR_SIG = bytes4(keccak256("burnCarbonDollar(address,uint256)"));
    bytes4 public constant DESTROY_BLACKLISTED_TOKENS_SIG = bytes4(keccak256("destroyBlacklistedTokens(address,uint256)"));
    bytes4 public constant APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = bytes4(keccak256("approveBlacklistedAddressSpender(address)"));
    bytes4 public constant BLACKLISTED_SIG = bytes4(keccak256("blacklisted()"));

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
        string _contractName) public onlyOwner { 
        Permission memory p = Permission(_permissionName, _permissionDescription, _contractName);
        _addPermission(_methodsignature, p);
    }

     /**
    * @notice Sets a permission within the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    * @param _permission A struct containing permission information.
    */
    function _addPermission(bytes4 _methodsignature, Permission _permission) internal {
        permissions[_methodsignature] = _permission;
        isPermission[_methodsignature] = true;
        emit PermissionAdded(_methodsignature);

    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) public onlyOwner {
        isPermission[_methodsignature] = false;
        emit PermissionRemoved(_methodsignature);
    }
    
    /**
    * @notice Sets a permission in the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function setUserPermission(address _who, bytes4 _methodsignature) public onlyOwner {
        require(isPermission[_methodsignature], "Permission being set must be for a valid method signature");
        hasUserPermission[_who][_methodsignature] = true;
        emit SetUserPermission(_who, _methodsignature);
    }

    /**
    * @notice Removes a permission from the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removeUserPermission(address _who, bytes4 _methodsignature) public onlyOwner {
        require(isPermission[_methodsignature], "Permission being removed must be for a valid method signature");
        hasUserPermission[_who][_methodsignature] = false;
        emit RemovedUserPermission(_who, _methodsignature);
    }
}