pragma solidity ^0.4.23;

import "../Regulator.sol";

contract WhitelistedTokenRegulator is Regulator {
    /**
    * @notice Sets the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        require(isPermission(MINT_CUSD_SIG), "Minting to CUSD not supported by token");
        setUserPermission(_who, MINT_SIG);
        setUserPermission(_who, MINT_CUSD_SIG);
    }

    /**
    * @dev Removes the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        require(isPermission(MINT_CUSD_SIG), "Minting to CUSD not supported by token");
        removeUserPermission(_who, MINT_SIG);
        removeUserPermission(_who, MINT_CUSD_SIG);
    }

    /**
    * @dev Removes the necessary permissions for a user to mint tokens. Overrides the simpler minting permissions
    * from the basic Regulator.
    * @param _who The address of the account that we are removing permissions for.
    */
    function isMinter(address _who) public view returns (bool) {
        return (hasUserPermission(_who, MINT_SIG) && hasUserPermission(_who, MINT_CUSD_SIG));
    }
}