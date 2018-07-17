pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./MutablePermissionedToken.sol";

// TODO switch to eternal proxy?

/**
* @title MutablePermissionedTokenProxy
* @notice Token contracts may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract MutablePermissionedTokenProxy is Ownable, AdminUpgradeabilityProxy {
    /**
     * @notice Claims ownership of a PermissionToken. Precondition: the
     * previous owner of the PermissionedToken already transferred ownership to 
     * this proxy.
     * @param _pToken The address of the PermissionToken contract.
     */
    function claimOwnership(address _pToken) public onlyOwner {
        MutablePermissionedToken(_pToken).claimOwnership();
    }
}