pragma solidity ^0.4.23;

import "../../upgradeability/DelayedUpgradeabilityProxy.sol";
import "./dataStorage/MutablePermissionedTokenStorage.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract PermissionedTokenProxy is DelayedUpgradeabilityProxy, Ownable, MutablePermissionedTokenStorage {
    constructor( address _implementation, address regulator, address balances, address allowances ) DelayedUpgradeabilityProxy( _implementation ) MutablePermissionedTokenStorage(regulator, balances, allowances) public {}

    /**
    * @dev Upgrade the backing implementation of the proxy.
    * Only the admin can call this function.
    * @param newImplementation Address of the new implementation.
    */
    function upgradeTo(address newImplementation) onlyOwner public {
        _setPendingUpgrade(newImplementation);
    }

    /**
    * @return The address of the implementation.
    */
    function implementation() onlyOwner public view returns (address) {
        return _implementation();
    }
}