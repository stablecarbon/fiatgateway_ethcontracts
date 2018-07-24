pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./Regulator.sol";

/**
* @title RegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the PermissionedToken to the correct version of the Regulator
* service.
*
*/
contract RegulatorProxy is Claimable, AdminUpgradeabilityProxy {
    constructor(address _implementation) AdminUpgradeabilityProxy(_implementation) public {}
    
    /**
     * @notice Claims ownership of a Regulator. Precondition: the
     * previous owner of the RegulatorProxy already transferred ownership to 
     * this proxy.
     * @param _reg The address of the Regulator contract.
     */
    function claimRegulatorOwnership(address _reg) public onlyOwner {
        // We use a low-level call here so that RegulatorProxy doesn't have to 
        // load regulator's bytecode.
        _reg.call(bytes4(keccak256("claimOwnership()")));
    }
}