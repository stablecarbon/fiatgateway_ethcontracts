pragma solidity ^0.4.23;

import "../Regulator.sol";

contract WhitelistedTokenRegulator is Regulator {
    constructor(address p, address v) Regulator(p,v) public {}

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

    function _setWhitelistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_SIG()), "Converting to CUSD not supported by token");
        permissions.setUserPermission(_who, permissions.CONVERT_SIG());
        super._setWhitelistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_SIG()), "Converting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_SIG());
        super._setBlacklistedUser(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(permissions.isPermission(permissions.CONVERT_SIG()), "Converting to CUSD not supported by token");
        permissions.removeUserPermission(_who, permissions.CONVERT_SIG());
        super._setNonlistedUser(_who);
    }
}