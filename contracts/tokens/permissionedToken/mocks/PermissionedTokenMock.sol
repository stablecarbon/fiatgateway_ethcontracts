pragma solidity ^0.4.23;

import "../PermissionedToken.sol";
import "../../../regulator/mocks/RegulatorMock.sol";
import "../../../regulator/RegulatorProxy.sol";

/**
* @title MutablePermissionedTokenMock
*
* @dev Should not be instantiated. Use MutablePermissionedTokenMock
* or ImmutablePermissionedTokenMock instead.
*/
contract PermissionedTokenMock is PermissionedToken {
    constructor(address v, address m, address w, address b, address n) internal {
        RegulatorMock r = new RegulatorMock(v, m, w, b, n);
        RegulatorProxy rp = new RegulatorProxy(address(r));
        rp.upgradeTo(r);
        rp.transferOwnership(address(this));
        rp.claimOwnership();
        setRP(rp);
    }
}