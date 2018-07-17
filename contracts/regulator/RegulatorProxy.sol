pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./Regulator.sol";

/**
* @title RegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the PermissionedToken to the correct version of the Regulator
* service.
*
*/
contract RegulatorProxy is Ownable, AdminUpgradeabilityProxy {
    /**
     * @notice Claims ownership of a Regulator. Precondition: the
     * previous owner of the Regulator already transferred ownership to 
     * this proxy.
     * @param _reg The address of the Regulator contract.
     */
    function claimOwnership(address _reg) public onlyOwner {
        Regulator(_reg).claimOwnership();
    }
}