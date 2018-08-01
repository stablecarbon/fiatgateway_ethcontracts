pragma solidity ^0.4.23;

import "../Regulator.sol";

/**
 * @title WhitelistedTokenRegulator
 * @dev WhitelistedTokenRegulator is a type of Regulator that modifies its definitions of
 * what constitutes a "whitelisted/nonlisted/blacklisted" user. A WhitelistedToken
 * provides a user the additional ability to convert from a whtielisted stablecoin into the
 * meta-token CUSD, or mint CUSD directly through a specific WT.
 *
 */
contract WhitelistedTokenRegulator is Regulator {
    constructor(address p, address v) Regulator(p,v) public {}

    // A WT minter should have option to either mint directly into CUSD via mintCUSD(), or
    // mint the WT via an ordinary mint() 
    function _setMinter(address _who) internal {
        require(permissions.isPermission(permissions.MINT_CUSD_SIG()), "Minting to CUSD not supported by token");
        permissions.setUserPermission(_who, permissions.MINT_CUSD_SIG());
        super._setMinter(_who);
    }

    function _removeMinter(address _who) internal {
        require(permissions.isPermission(permissions.MINT_CUSD_SIG()), "Minting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.MINT_CUSD_SIG());
        super._removeMinter(_who);
    }

    function isMinter(address _who) public view returns (bool) {
        return (super.isMinter(_who) && hasUserPermission(_who, permissions.MINT_CUSD_SIG()));
    }

    // Setters

    // A WT whitelisted user should gain ability to convert their WT into CUSD. They can also burn their WT, as a
    // PermissionedToken whitelisted user can do
    function _setWhitelistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_WT_SIG()), "Converting to CUSD not supported by token");
        permissions.setUserPermission(_who, permissions.CONVERT_WT_SIG());
        super._setWhitelistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_WT_SIG()), "Converting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_WT_SIG());
        super._setBlacklistedUser(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_WT_SIG()), "Converting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_WT_SIG());
        super._setNonlistedUser(_who);
    }

    // Getters

    function isWhitelistedUser(address _who) public view returns (bool) {
        return (hasUserPermission(_who, permissions.CONVERT_WT_SIG()) && super.isWhitelistedUser(_who));
    }

    function isBlacklistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, permissions.CONVERT_WT_SIG()) && super.isBlacklistedUser(_who));
    }

    function isNonlistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, permissions.CONVERT_WT_SIG()) && super.isNonlistedUser(_who));
    }   
}