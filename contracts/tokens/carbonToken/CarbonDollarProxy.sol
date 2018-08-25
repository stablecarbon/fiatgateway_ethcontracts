pragma solidity ^0.4.24;

import "./dataStorage/CarbonDollarStorage.sol";
import "../permissionedToken/dataStorage/PermissionedTokenStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";
import '../../regulator/carbonDollarRegulator/CarbonDollarRegulator.sol';

/**
* @title CarbonDollarProxy
* @notice This contract will be the public facing CarbonUSD. All calls to the CarbonUSD contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract CarbonDollarProxy is PermissionedTokenProxy {
    
    CarbonDollarStorage public tokenStorage_CD;

    /** CONSTRUCTOR
    * @dev Passes along arguments to base class.
    */
    constructor(address _implementation, address _regulator) public PermissionedTokenProxy(_implementation, _regulator) {
        // base class override
        regulator = CarbonDollarRegulator(_regulator);

        tokenStorage_CD = new CarbonDollarStorage();

    }
}