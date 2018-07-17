pragma solidity ^0.4.23;

import '../../eternalStorage/EternalStorage.sol';

contract PermissionStorage is EternalStorage {
	 
	
	/** 
        Constants: stores method signatures 
    */
    bytes4 public DESTROYSELF_SIG = bytes4(keccak256("destroySelf()"));
    bytes4 public BURN_SIG = bytes4(keccak256("burn(uint256)"));
    bytes4 public MINT_SIG = bytes4(keccak256("mint(address,uint256)"));
    bytes4 public DESTROYBLACKLIST_SIG = bytes4(keccak256("destroyBlacklistedTokens(address)"));
    bytes4 public ADD_BLACKLISTED_SPENDER_SIG = bytes4(keccak256("addBlacklistedAddressSpender(address)"));

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