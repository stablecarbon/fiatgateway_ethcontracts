pragma solidity ^0.4.23;

import "../dataStorage/RegulatorStorageConsumer.sol";
import "../Regulator.sol";

/**
*
* @dev creates a Regulator connected to an empty RegulatorStorage
*
*/
contract RegulatorFullyLoadedMock is Regulator, RegulatorStorageConsumer {


	/** 
        @dev Creates permissions for all functions in WhitelistedToken.
     */
    constructor(address permissions, address validators, address validator) RegulatorStorageConsumer(permissions, validators) public {

        // Each of these permission-setting procedures are separated into functions.
        // Because otherwise, Solidity complains about the size that the permission structs
        // take up on the stack if all of the structs are declared in memory within the
        // same function.
        _validators.addValidator(validator);
        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setDestroyBlacklistedTokensPermission();
        setApproveBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        _permissions.addPermission(_permissions.MINT_SIG(), '','','');
    }
    
    function setMintCUSDPermission() internal {
        _permissions.addPermission(_permissions.MINT_CUSD_SIG(), '','','');
    }

    function setBurnPermission() internal {
        _permissions.addPermission(_permissions.BURN_SIG(), '','','');
    }

    function setDestroyBlacklistedTokensPermission() internal {
        _permissions.addPermission(_permissions.DESTROY_BLACKLISTED_TOKENS_SIG(), '','','');
    }

    function setApproveBlacklistedAddressSpenderPermission() internal {
        _permissions.addPermission(_permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG(), '','','');
    }

    function setDestroySelfPermission() internal {
        _permissions.addPermission(_permissions.BLACKLISTED_SIG(), '','','');
    }
}