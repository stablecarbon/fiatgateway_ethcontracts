pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./MutablePermissionedToken.sol";

/**
* @title MutablePermissionedTokenProxy
* @notice Token contracts may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract MutablePermissionedTokenProxy is Ownable, AdminUpgradeabilityProxy {
    /**
     * @notice Claims ownership of a MutablePermissionToken. Precondition: the
     * previous owner of the MutablePermissionedToken already transferred ownership to 
     * this proxy.
     * @param _pToken The address of the PermissionToken contract.
     */
    function claimTokenOwnership(address _pToken) public onlyOwner {
        _pToken.call(bytes4(keccak256("claimOwnership()")));
    }
}