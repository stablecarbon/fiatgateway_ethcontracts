pragma solidity ^0.4.24;

import "./dataStorage/CarbonDollarStorage.sol";
import "../permissionedToken/dataStorage/PermissionedTokenStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";

/**
* @title CarbonDollarProxy
* @notice This contract will be the public facing CarbonUSD. All calls to the CarbonUSD contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract CarbonDollarProxy is UpgradeabilityProxy, CarbonDollarStorage, PermissionedTokenStorage {
    
    /** CONSTRUCTOR
    * @dev Passes along arguments to base class.
    * @param _implementation the initial logic implementation
    * @param _regulator the Regulator, should be a CarbonDollarRegulator     */
    constructor(address _implementation, address _regulator) public
    UpgradeabilityProxy(_implementation)
    PermissionedTokenStorage(_regulator) {}

    /**
    * @dev Upgrade the backing implementation of the proxy.
    * Only the admin can call this function.
    * @param newImplementation Address of the new implementation.
    */
    function upgradeTo(address newImplementation) public onlyOwner {
        _upgradeTo(newImplementation);

    }

    /**
    * @return The address of the implementation.
    */
    function implementation() public view returns (address) {
        return _implementation();
    }
}