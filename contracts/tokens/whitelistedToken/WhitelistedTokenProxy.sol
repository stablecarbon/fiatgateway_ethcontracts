pragma solidity ^0.4.24;

import "./dataStorage/MutableWhitelistedTokenStorage.sol";
import "../permissionedToken/dataStorage/MutablePermissionedTokenStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";

/**
* @title WhitelistedTokenProxy
* @notice This contract IS a WhitelistedToken. All calls to the WhitelistedToken contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract WhitelistedTokenProxy is UpgradeabilityProxy, MutableWhitelistedTokenStorage, MutablePermissionedTokenStorage {
    constructor(address _implementation, address _regulator, address _balances, address _allowances, address _cusd) public
    UpgradeabilityProxy(_implementation)
    MutableWhitelistedTokenStorage(_cusd)
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