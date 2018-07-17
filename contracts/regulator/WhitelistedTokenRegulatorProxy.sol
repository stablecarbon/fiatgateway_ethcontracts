pragma solidity ^0.4.23;

import "./RegulatorProxy.sol";
import "./WhitelistedTokenRegulator.sol";

// TODO switch to eternal proxy?

/**
* @title WhitelistedTokenRegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the WhitelistedToken to the correct version of the WhitelistedTokenRegulator
* service.
*
*/
contract WhitelistedTokenRegulatorProxy is RegulatorProxy {
    /**
     * @notice Claims ownership of a WhitelistedToken. Precondition: the
     * previous owner of the WhitelistedToken already transferred ownership to 
     * this proxy.
     * @param _reg The address of the WhitelistedToken contract.
     */
    function claimOwnership(address _reg) public onlyOwner {
        WhitelistedTokenRegulator(_reg).claimOwnership();
    }
}