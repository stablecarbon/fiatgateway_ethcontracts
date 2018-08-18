pragma solidity ^0.4.24;

import "./dataStorage/MutablePermissionedTokenStorage.sol";
import "zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol";

/**
* @title PermissionedTokenProxy
* @notice A proxy contract that serves the latest implementation of PermissionedToken.
*/
contract PermissionedTokenProxy is UpgradeabilityProxy, MutablePermissionedTokenStorage {
    constructor(address _implementation, address _regulator, address _balances, address _allowances) 
    UpgradeabilityProxy(_implementation) 
    MutablePermissionedTokenStorage(_regulator, _balances, _allowances) public {}

    /**
    * @dev Upgrade the backing implementation of the proxy.
    * Only the admin can call this function.
    * @param newImplementation Address of the new implementation.
    */
    function upgradeTo(address newImplementation) public onlyOwner {
        // _setPendingUpgrade(newImplementation);
        _upgradeTo(newImplementation);
    }

    /**
    * @return The address of the implementation.
    */
    function implementation() public view returns (address) {
        return _implementation();
    }
}