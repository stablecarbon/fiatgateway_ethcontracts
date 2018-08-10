pragma solidity ^0.4.24;

import "../Regulator.sol";

/**
 * @title CarbonDollarRegulator
 * @dev CarbonDollarRegulator is a type of Regulator that modifies its definitions of
 * what constitutes a "whitelisted/nonlisted/blacklisted" user. A CarbonDollar
 * provides a user the additional ability to convert from CUSD into a whtielisted stablecoin
 *
 */
contract CarbonDollarRegulator is Regulator {

    constructor(address p, address v) Regulator(p,v) public {}

    // Setters: CarbonDollarRegulator overrides the definitions of whitelisted, nonlisted, and blacklisted setUserPermission

    // CarbonDollar whitelisted users burn CUSD into a WhitelistedToken. Unlike PermissionedToken 
    // whitelisted users, CarbonDollar whitelisted users cannot burn ordinary CUSD without converting into WT
    function _setWhitelistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_CARBON_DOLLAR_SIG()), "Converting CUSD not supported");
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Blacklisting not supported by token");
        permissions.setUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG());
        permissions.setUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        permissions.removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetWhitelistedUser(_who);

    }

    function _setBlacklistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_CARBON_DOLLAR_SIG()), "Converting CUSD not supported");
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Blacklisting not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG());
        permissions.removeUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        permissions.setUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetBlacklistedUser(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_CARBON_DOLLAR_SIG()), "Converting CUSD not supported");
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Blacklisting not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG());
        permissions.removeUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        permissions.removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetNonlistedUser(_who);
    }

    // Getters
    function isWhitelistedUser(address _who) public view returns(bool) {
        return (hasUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG()) 
        && hasUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG()) 
        && !hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }

    function isBlacklistedUser(address _who) public view returns(bool) {
        return (!hasUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG()) 
        && !hasUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG()) 
        && hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }

    function isNonlistedUser(address _who) public view returns(bool) {
        return (!hasUserPermission(_who, permissions.CONVERT_CARBON_DOLLAR_SIG()) 
        && !hasUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG()) 
        && !hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }
}