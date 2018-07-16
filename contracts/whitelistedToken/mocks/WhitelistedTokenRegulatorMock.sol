pragma solidity ^0.4.23;

import "../../permissionedToken/mocks/RegulatorMock.sol";

contract WhitelistedTokenRegulatorMock is RegulatorMock {
    /** @dev Inherits constructor from RegulatorMock. **/
    constructor(address v, address m, address w, address b, address n) RegulatorMock(v, m, w, b, n) public {}
}