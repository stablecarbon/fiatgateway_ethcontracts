pragma solidity ^0.4.23;

import "./Regulator.sol";

contract WhitelistedTokenRegulator is Regulator {
    /**
    * @notice Sets the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        require(permissions.isPermission(permissions.MINT_CUSD_SIG()), "Minting to CUSD not supported by token");
        permissions.setUserPermission(_who, permissions.MINT_SIG());
        permissions.setUserPermission(_who, permissions.MINT_CUSD_SIG());
    }

    /**
    * @dev Removes the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        require(permissions.isPermission(permissions.MINT_CUSD_SIG()), "Minting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.MINT_SIG());
        permissions.removeUserPermission(_who, permissions.MINT_CUSD_SIG());
    }

    /**
    * @dev Removes the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are removing permissions for.
    */
    function isMinter(address _who) public view returns (bool) {
        return (hasUserPermission(_who, permissions.MINT_SIG()) && hasUserPermission(_who, permissions.MINT_CUSD_SIG()));
    }
}