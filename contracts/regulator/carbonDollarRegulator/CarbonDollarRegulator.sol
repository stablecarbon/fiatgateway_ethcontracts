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

    // Getters
    function isWhitelistedUser(address _who) public view returns(bool) {
        return (hasUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG) 
        && hasUserPermission(_who, BURN_CARBON_DOLLAR_SIG) 
        && !hasUserPermission(_who, BLACKLISTED_SIG));
    }

    function isBlacklistedUser(address _who) public view returns(bool) {
        return (!hasUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG) 
        && !hasUserPermission(_who, BURN_CARBON_DOLLAR_SIG) 
        && hasUserPermission(_who, BLACKLISTED_SIG));
    }

    function isNonlistedUser(address _who) public view returns(bool) {
        return (!hasUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG) 
        && !hasUserPermission(_who, BURN_CARBON_DOLLAR_SIG) 
        && !hasUserPermission(_who, BLACKLISTED_SIG));
    }

    /** Internal functions **/
    
    // Setters: CarbonDollarRegulator overrides the definitions of whitelisted, nonlisted, and blacklisted setUserPermission

    // CarbonDollar whitelisted users burn CUSD into a WhitelistedToken. Unlike PermissionedToken 
    // whitelisted users, CarbonDollar whitelisted users cannot burn ordinary CUSD without converting into WT
    function _setWhitelistedUser(address _who) internal {
        require(isPermission(CONVERT_CARBON_DOLLAR_SIG), "Converting CUSD not supported");
        require(isPermission(BURN_CARBON_DOLLAR_SIG), "Burning CUSD not supported");
        require(isPermission(BLACKLISTED_SIG), "Blacklisting not supported");
        setUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG);
        setUserPermission(_who, BURN_CARBON_DOLLAR_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit LogWhitelistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(isPermission(CONVERT_CARBON_DOLLAR_SIG), "Converting CUSD not supported");
        require(isPermission(BURN_CARBON_DOLLAR_SIG), "Burning CUSD not supported");
        require(isPermission(BLACKLISTED_SIG), "Blacklisting not supported");
        removeUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG);
        removeUserPermission(_who, BURN_CARBON_DOLLAR_SIG);
        setUserPermission(_who, BLACKLISTED_SIG);
        emit LogBlacklistedUser(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(isPermission(CONVERT_CARBON_DOLLAR_SIG), "Converting CUSD not supported");
        require(isPermission(BURN_CARBON_DOLLAR_SIG), "Burning CUSD not supported");
        require(isPermission(BLACKLISTED_SIG), "Blacklisting not supported");
        removeUserPermission(_who, CONVERT_CARBON_DOLLAR_SIG);
        removeUserPermission(_who, BURN_CARBON_DOLLAR_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit LogNonlistedUser(_who);
    }
}