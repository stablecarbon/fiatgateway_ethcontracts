pragma solidity ^0.4.24;

import "./dataStorage/PermissionedTokenStorage.sol";
import "zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol";
import "../../regulator/Regulator.sol";
import '../../helpers/Ownable.sol';

/**
* @title PermissionedTokenProxy
* @notice A proxy contract that serves the latest implementation of PermissionedToken.
*/
contract PermissionedTokenProxy is UpgradeabilityProxy, Ownable {
    
    PermissionedTokenStorage public tokenStorage;
    Regulator public regulator;

    constructor(address _implementation, address _regulator) 
    UpgradeabilityProxy(_implementation) public {
        regulator = Regulator(_regulator);
        tokenStorage = new PermissionedTokenStorage();
    }

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