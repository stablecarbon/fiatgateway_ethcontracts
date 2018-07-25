pragma solidity ^0.4.23;

import "../PermissionsStorage.sol";

contract PermissionsStorageMock is PermissionsStorage {
    /** 
        @dev Creates permissions for all functions in WhitelistedToken.
     */
    constructor() public {
        // Each of these permission-setting procedures are separated into functions.
        // Because otherwise, Solidity complains about the size that the permission structs
        // take up on the stack if all of the structs are declared in memory within the
        // same function.
        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setDestroyBlacklistedTokensPermission();
        setAddBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        Permission memory mint_permission = Permission(
            "Mint", 
            "Allows a trusted minter (e.g. a trust funds) to mint WT0 tokens for a user.", 
            "PermissionedToken");
        _addPermission(MINT_SIG, mint_permission);
    }
    
    function setMintCUSDPermission() internal {
        Permission memory mint_cusd_permission = Permission(
            "Mint CUSD", 
            "Allows a trusted minter (e.g. a trust funds) to mint CUSD tokens for a user.", 
            "WhitelistedToken");
        _addPermission(MINT_CUSD_SIG, mint_cusd_permission);
    }

    function setBurnPermission() internal {
        Permission memory burn_permission = Permission(
            "Burn", 
            "Allows a user to burn off their own tokens. They can then send this burn transaction as a receipt to a trust fund in order to withdraw collateral", 
            "PermissionedToken");
        _addPermission(BURN_SIG, burn_permission);
    }

    function setDestroyBlacklistedTokensPermission() internal {
        Permission memory destroy_tokens_permission = Permission(
            "Destroy User's Blacklisted Tokens", 
            "Allows a regulatory entity to destroy tokens contained within a blacklisted user's account.", 
            "PermissionedToken");
        _addPermission(DESTROY_BLACKLISTED_TOKENS_SIG, destroy_tokens_permission);
    }

    function setAddBlacklistedAddressSpenderPermission() internal {
        Permission memory add_blacklisted_spender_permission = Permission(
            "Add Self to Blacklisted Token as an Approved Spender", 
            "Allows a regulatory entity to add themselves as an approved spender on a blacklisted account, in order to transfer tokens out of it.", 
            "PermissionedToken");
        _addPermission(ADD_BLACKLISTED_ADDRESS_SPENDER_SIG, add_blacklisted_spender_permission);
    }

    function setDestroySelfPermission() internal {
        Permission memory blacklisted_permission = Permission(
            "Blacklist", 
            "Function is essentially used as a \"marker\" for a blacklisted user.", 
            "PermissionedToken");
        _addPermission(BLACKLISTED_SIG, blacklisted_permission);
    }
}