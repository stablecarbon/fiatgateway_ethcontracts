pragma solidity ^0.4.23;

import "../Regulator.sol";

contract CarbonDollarRegulator is Regulator {
    constructor(address p, address v) Regulator(p,v) public {}

    function isMinter(address _who) public view returns (bool) {
        return (super.isMinter(_who) && hasUserPermission(_who, permissions.MINT_CUSD_SIG()));
    }

    function _setWhitelistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        permissions.setUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        super._setWhitelistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        permissions.removeUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        super._setBlacklistedUser(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_CARBON_DOLLAR_SIG()), "Burning CUSD not supported");
        permissions.removeUserPermission(_who, permissions.BURN_CARBON_DOLLAR_SIG());
        super._setNonlistedUser(_who);
    }
}