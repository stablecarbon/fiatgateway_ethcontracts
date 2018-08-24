pragma solidity ^0.4.24;

import "../Regulator.sol";

/**
*
* @dev creates a Reglator with a single Validator and all Permissions 
*
**/
contract RegulatorMock is Regulator {
    /** 
        @dev Initializes common permissions from validator, validator set to msg.sender
     */
    constructor() public {
        addValidator(msg.sender);
        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setConvertCarbonDollarPermission();
        setBurnCarbonDollarPermission();
        setConvertWTPermission();
        setDestroyBlacklistedTokensPermission();
        setApproveBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        addPermission(MINT_SIG, "","","");
    }
    
    function setMintCUSDPermission() internal {
        addPermission(MINT_CUSD_SIG, "","","");
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

    function setConvertWTPermission() internal {
        addPermission(CONVERT_WT_SIG, "","","");
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