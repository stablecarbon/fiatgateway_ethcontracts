pragma solidity ^0.4.23;

import "./dataStorage/MutableCarbonDollarStorage.sol";
import "../permissionedToken/dataStorage/MutablePermissionedTokenStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";

/**
* @title CarbonDollarProxy
* @notice This contract IS CarbonUSD. All calls to the CarbonUSD contract will
* be routed through this proxy, since this proxy contract is the owner of the
* storage contracts.
*/
contract CarbonDollarProxy is UpgradeabilityProxy, Ownable, MutableCarbonDollarStorage, MutablePermissionedTokenStorage {

    constructor(address i, address r, address b, address a, address f, address s) 
    UpgradeabilityProxy(i)
    MutableCarbonDollarStorage(f, s)
    MutablePermissionedTokenStorage(r, b, a) public {}

    /**
    * @dev Upgrade the backing implementation of the proxy.
    * Only the admin can call this function.
    * @param newImplementation Address of the new implementation.
    */
    function upgradeTo(address newImplementation) public onlyOwner {
        _upgradeTo(newImplementation);

    }

    /**
    * @dev Upgrade the backing implementation of the proxy and call a function
    * on the new implementation.
    * This is useful to initialize the proxied contract.
    * @param newImplementation Address of the new implementation.
    * @param data Data to send as msg.data in the low level call.
    * It should include the signature and the parameters of the function to be
    * called, as described in
    * https://solidity.readthedocs.io/en/develop/abi-spec.html#function-selector-and-argument-encoding.
    */
    function upgradeToAndCall(address newImplementation, bytes data) public payable onlyOwner {
        _upgradeTo(newImplementation);
        require(address(this).call.value(msg.value)(data));
    }

      /**
    * @return The address of the implementation.
    */
    function implementation() public view onlyOwner returns (address) {
        return _implementation();
    }
}