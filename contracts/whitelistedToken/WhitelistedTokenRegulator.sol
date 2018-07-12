pragma solidity ^0.4.23;

import "../permissions/Regulator.sol";

contract WhitelistedTokenRegulator is Regulator {
    /**
    * @notice Sets the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are setting permissions for.
    */
    bytes4 MINT_CUSD_SIG = bytes4(keccak256("mint(address,uint256,bool)"));

    function setMinter(address _who) public onlyValidator {
        require(availablePermissions.isPermission(MINT_SIG), "Minting not supported by token");
        require(availablePermissions.isPermission(MINT_CUSD_SIG), "Minting to CUSD not supported by token");
        userPermissions.setPermission(_who, MINT_SIG);
        userPermissions.setPermission(_who, MINT_CUSD_SIG);
    }

    /**
    * @dev Removes the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        require(availablePermissions.isPermission(MINT_SIG), "Minting not supported by token");
        require(availablePermissions.isPermission(MINT_CUSD_SIG), "Minting to CUSD not supported by token");
        userPermissions.removePermission(_who, MINT_SIG);
        userPermissions.removePermission(_who, MINT_CUSD_SIG);
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasPermission(_who, MINT_SIG);
    }
}