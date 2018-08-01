pragma solidity ^0.4.23;

import "../dataStorage/PermissionSheet.sol";

/**
*
* @dev creates a PermissionSheet-loaded with all permissions
*
*/
contract PermissionSheetMock is PermissionSheet {

    constructor() public {

        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setConvertCarbonDollarPermission();
        setConvertPermission();
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

    function setConvertPermission() internal {
        addPermission(CONVERT_SIG, "","","");
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