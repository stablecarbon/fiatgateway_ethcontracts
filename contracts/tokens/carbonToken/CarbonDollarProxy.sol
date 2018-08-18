pragma solidity ^0.4.24;

import "./dataStorage/MutableCarbonDollarStorage.sol";
import "../permissionedToken/dataStorage/MutablePermissionedTokenStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";

/**
* @title CarbonDollarProxy
* @notice This contract will be the public facing CarbonUSD. All calls to the CarbonUSD contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract CarbonDollarProxy is UpgradeabilityProxy, MutableCarbonDollarStorage, MutablePermissionedTokenStorage {
    
    /** CONSTRUCTOR
    * @dev Passes along arguments to base class.
    * @param _implementation the initial logic implementation
    * @param _regulator the Regulator, should be a CarbonDollarRegulator 
    * @param _balances BalanceSheet
    * @param _allowances AllowanceSheet
    * @param _fees FeeSheet
    * @param _stablecoins StablecoinWhitelist
    */
    constructor(address _implementation, address _regulator, address _balances, address _allowances, address _fees, address _stablecoins) public
    UpgradeabilityProxy(_implementation)
    MutableCarbonDollarStorage(_fees, _stablecoins)
    MutablePermissionedTokenStorage(_regulator, _balances, _allowances) {}

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