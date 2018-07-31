pragma solidity ^0.4.23;

import "../dataStorage/PermissionSheet.sol";

/**
*
* @dev creates a PermissionSheet full of permissions
*
*/
contract PermissionSheetMock is PermissionSheet {

    constructor() public {

        setMintPermission();
        setMintCUSDPermission();
        setBurnPermission();
        setDestroyBlacklistedTokensPermission();
        setApproveBlacklistedAddressSpenderPermission();
        setDestroySelfPermission();
    }

    function setMintPermission() internal {
        addPermission(MINT_SIG, '','','');
    }
    
    function setMintCUSDPermission() internal {
        addPermission(MINT_CUSD_SIG, '','','');
    }

    function setBurnPermission() internal {
        addPermission(BURN_SIG, '','','');
    }

    function setDestroyBlacklistedTokensPermission() internal {
        addPermission(DESTROY_BLACKLISTED_TOKENS_SIG, '','','');
    }

    function setApproveBlacklistedAddressSpenderPermission() internal {
        addPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG, '','','');
    }

    function setDestroySelfPermission() internal {
        addPermission(BLACKLISTED_SIG, '','','');
    }
}