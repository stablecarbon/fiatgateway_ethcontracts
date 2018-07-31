pragma solidity ^0.4.23;

import "../../mocks/RegulatorFullyLoadedMock.sol";

contract CarbonDollarRegulatorMock is RegulatorFullyLoadedMock {
    constructor(address ps, address vs, address v) RegulatorFullyLoadedMock(ps,vs,v) public {}
}