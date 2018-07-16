pragma solidity ^0.4.23;

import '../../eternalStorage/EternalStorage.sol';

contract PermissionStorage is EternalStorage {
	 
	/** 
        Structs 
    */
    
    /** Contains metadata about a permission to execute a particular method signature. */
    struct Permission {
        string name; // A one-word description for the permission. e.g. "canMint"
        string description; // A longer description for the permission. e.g. "Allows user to mint tokens."
        string contract_name; // e.g. "PermissionedToken"
    }

	mapping(bytes4 => Permission) internal permissionStorage;

}