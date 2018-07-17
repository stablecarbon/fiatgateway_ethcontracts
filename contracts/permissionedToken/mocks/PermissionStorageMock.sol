pragma solidity ^0.4.23;

import "../regulator/PermissionStorage.sol";

contract PermissionStorageMock is PermissionStorage {
    /**
      Constants: method signatures.
    **/
    bytes4 public MINT = bytes4(keccak256("mint(address,uint256)"));
    bytes4 public MINT_CUSD = bytes4(keccak256("mint(address,uint256,bool)"));
    bytes4 public BURN = bytes4(keccak256("burn(uint256)"));
    bytes4 public TRANSFER = bytes4(keccak256("transfer(address,uint256)"));
    bytes4 public TRANSFER_FROM = bytes4(keccak256("transferFrom(address,address,uint256)"));
    bytes4 public DESTROY_BLACKLISTED_TOKENS = bytes4(keccak256("destroyBlacklistedTokens(address)"));
    bytes4 public ADD_BLACKLISTED_ADDRESS_SPENDER = bytes4(keccak256("addBlacklistedAddressSpender(address)"));
    bytes4 public DESTROY_SELF = bytes4(keccak256("destroySelf()"));

    /** 
        @dev Creates permissions for all functions in WhitelistedToken.
     */
    constructor() PermissionStorage() public {
        // Each of these permission-setting procedures are separated into functions.
        // Because otherwise, Solidity complains about the size that the permission structs
        // take up on the stack if all of the structs are declared in memory within the
        // same function.
        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setTransferPermission();
        setTransferFromPermission();
        setDestroyBlacklistedTokensPermission();
        setAddBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        Permission memory mint_permission = Permission(
            "Mint", 
            "Allows a trusted minter (e.g. a trust funds) to mint WT0 tokens for a user.", 
            "PermissionedToken");
        addPermission(MINT, mint_permission);
    }
    
    function setMintCUSDPermission() internal {
        Permission memory mint_cusd_permission = Permission(
            "Mint CUSD", 
            "Allows a trusted minter (e.g. a trust funds) to mint CUSD tokens for a user.", 
            "WhitelistedToken");
        addPermission(MINT_CUSD, mint_cusd_permission);
    }

    function setBurnPermission() internal {
        Permission memory burn_permission = Permission(
            "Burn", 
            "Allows a user to burn off their own tokens. They can then send this burn transaction as a receipt to a trust fund in order to withdraw collateral", 
            "PermissionedToken");
        addPermission(BURN, burn_permission);
    }

    function setTransferPermission() internal {
        Permission memory transfer_permission = Permission(
            "Transfer", 
            "Allows a user to transfer their tokens to another user.", 
            "PermissionedToken");
        addPermission(TRANSFER, transfer_permission);
    }

    function setTransferFromPermission() internal {
        Permission memory transfer_from_permission = Permission(
            "Transfer From", 
            "Allows a user to transfer tokens from one address to another.", 
            "PermissionedToken");
        addPermission(TRANSFER_FROM, transfer_from_permission);
    }

    function setDestroyBlacklistedTokensPermission() internal {
        Permission memory destroy_tokens_permission = Permission(
            "Destroy User's Blacklisted Tokens", 
            "Allows a regulatory entity to destroy tokens contained within a blacklisted user's account.", 
            "PermissionedToken");
        addPermission(DESTROY_BLACKLISTED_TOKENS, destroy_tokens_permission);
    }

    function setAddBlacklistedAddressSpenderPermission() internal {
        Permission memory add_blacklisted_spender_permission = Permission(
            "Add Self to Blacklisted Token as an Approved Spender", 
            "Allows a regulatory entity to add themselves as an approved spender on a blacklisted account, in order to transfer tokens out of it.", 
            "PermissionedToken");
        addPermission(ADD_BLACKLISTED_ADDRESS_SPENDER, add_blacklisted_spender_permission);
    }

    function setDestroySelfPermission() internal {
        Permission memory destroy_self_permission = Permission(
            "Self Destroy", 
            "Allows a user to destroy themselves. While a user would probably never use this function, it is essentially used as a \"marker\" for a blacklisted user.", 
            "PermissionedToken");
        addPermission(DESTROY_SELF, destroy_self_permission);
    }
}