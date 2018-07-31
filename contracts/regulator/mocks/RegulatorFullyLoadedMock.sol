pragma solidity ^0.4.23;

import "../dataStorage/MutableRegulatorStorage.sol";
import "../Regulator.sol";

/**
*
* @dev creates a Regulator connected to an empty RegulatorStorage
*
*/
contract RegulatorFullyLoadedMock is Regulator {


    /** 
        @dev Creates permissions for all functions in WhitelistedToken.
     */
    constructor(address ps, address vs, address validator) Regulator(ps, vs) public {
        // Each of these permission-setting procedures are separated into functions.
        // Because otherwise, Solidity complains about the size that the permission structs
        // take up on the stack if all of the structs are declared in memory within the
        // same function.
        validators.addValidator(validator);
        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setDestroyBlacklistedTokensPermission();
        setApproveBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        permissions.addPermission(permissions.MINT_SIG(), '','','');
    }
    
    function setMintCUSDPermission() internal {
        permissions.addPermission(permissions.MINT_CUSD_SIG(), '','','');
    }

    function setBurnPermission() internal {
        permissions.addPermission(permissions.BURN_SIG(), '','','');
    }

    function setDestroyBlacklistedTokensPermission() internal {
        permissions.addPermission(permissions.DESTROY_BLACKLISTED_TOKENS_SIG(), '','','');
    }

    function setApproveBlacklistedAddressSpenderPermission() internal {
        permissions.addPermission(permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG(), '','','');
    }

    function setDestroySelfPermission() internal {
        permissions.addPermission(permissions.BLACKLISTED_SIG(), '','','');
    }
}