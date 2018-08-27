pragma solidity ^0.4.24;

import "../carbonDollarRegulator/CarbonDollarRegulator.sol";

/**
*
* @dev creates a CD Regulator with a single Validator and all Permissions
*
**/
contract CarbonDollarMockMissingPermissions is CarbonDollarRegulator {
    /**
        @dev Initializes common permissions from validator, validator set to msg.sender
     */
    constructor() public {
        addValidator(msg.sender);
        setMintPermission();
        setBurnPermission();
        setDestroyBlacklistedTokensPermission();
        setApproveBlacklistedAddressSpenderPermission();
    }

    function setMintPermission() internal {
        addPermission(MINT_SIG, "","","");
    }

    function setBurnPermission() internal {
        addPermission(BURN_SIG, "","","");
    }

    function setConvertCarbonDollarPermission() internal {
        addPermission(CONVERT_CARBON_DOLLAR_SIG, "","","");
    }

    function setBurnCarbonDollarPermission() internal {
        addPermission(BURN_CARBON_DOLLAR_SIG, "","","");
    }

    function setDestroyBlacklistedTokensPermission() internal {
        addPermission(DESTROY_BLACKLISTED_TOKENS_SIG, "","","");
    }

    function setApproveBlacklistedAddressSpenderPermission() internal {
        addPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG, "","","");
    }

    function setDestroySelfPermission() internal {
        addPermission(BLACKLISTED_SIG, "","","");
    }
}
