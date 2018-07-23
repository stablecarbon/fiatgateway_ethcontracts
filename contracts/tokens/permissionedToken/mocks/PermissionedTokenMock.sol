pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../../../regulator/mocks/RegulatorMock.sol";
import "../../../regulator/RegulatorProxy.sol";

/**
* @title MutablePermissionedTokenMock
*/
contract PermissionedTokenMock is PermissionedToken {
    constructor(address validator, 
                address minter, 
                address whitelisted, 
                address blacklisted, 
                address nonlisted) internal {
        RegulatorMock r = new RegulatorMock(validator, minter, whitelisted, blacklisted, nonlisted);
        RegulatorProxy rp = new RegulatorProxy(address(r));
        rp.upgradeTo(r);
        rp.transferOwnership(address(this));
        rp.claimOwnership();
        setRP(rp);
    }
}