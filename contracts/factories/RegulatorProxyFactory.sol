pragma solidity ^0.4.24;

import "../regulator/RegulatorProxy.sol";
import "../regulator/Regulator.sol";
import '../regulator/dataStorage/RegulatorStorage.sol';

/**
*
* @dev RegulatorProxyFactory creates new RegulatorProxy contracts with new data storage sheets, properly configured
* with ownership, and the proxy logic implementations are based on a user-specified Regulator. 
*
**/
contract RegulatorProxyFactory {
    // Parameters
    address[] public regulators;

    // Events
    event CreatedRegulatorProxy(address newRegulator, uint256 index);

    /**
    *
    * @dev generate a new proxyaddress that users can cast to a Regulator or RegulatorProxy. The
    * proxy has empty data storage contracts connected to it and it is set with an initial logic contract
    * to which it will delegate functionality
    * @notice the method caller will have to claim ownership of regulators since regulators are claimable
    * @param regulatorImplementation the address of the logic contract that the proxy will initialize its implementation to
    *
    **/
    function createRegulatorProxy(address regulatorImplementation) public {

        // Store new data storage contracts for regulator proxy
        address proxy = address(new RegulatorProxy(regulatorImplementation));

        // The function caller should own the proxy contract, so they will need to claim ownership
        RegulatorProxy(proxy).transferOwnership(msg.sender);

        regulators.push(proxy);
        emit CreatedRegulatorProxy(proxy, getCount()-1);
    }

    /** 
    *
    * @dev generate a new proxyaddress pointing to a regulator loaded with all permissions
    * and an initial validator of the caller's choosing
    *
    **/
    function createRegulatorProxyFullyLoaded(address regulatorImplementation, address validator) public {

        // Store new data storage contracts for regulator proxy
        address proxy = address(new RegulatorProxy(regulatorImplementation));
        Regulator regulator = Regulator(proxy);

        // Set up proxy
        regulator.addValidator(validator);
        regulator.addPermission(regulator.MINT_SIG(), "","","");
        regulator.addPermission(regulator.MINT_CUSD_SIG(), "","","");
        regulator.addPermission(regulator.BURN_SIG(), "","","");
        regulator.addPermission(regulator.CONVERT_CARBON_DOLLAR_SIG(), "","","");
        regulator.addPermission(regulator.BURN_CARBON_DOLLAR_SIG(), "","","");
        regulator.addPermission(regulator.CONVERT_WT_SIG(), "","","");
        regulator.addPermission(regulator.DESTROY_BLACKLISTED_TOKENS_SIG(), "","","");
        regulator.addPermission(regulator.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG(), "","","");
        regulator.addPermission(regulator.BLACKLISTED_SIG(), "","","");

        // The function caller should own the proxy contract, so they will need to claim ownership
        RegulatorProxy(proxy).transferOwnership(msg.sender);

        regulators.push(proxy);
        emit CreatedRegulatorProxy(proxy, getCount()-1);
    }

    // Return number of proxies created 
    function getCount() public view returns (uint256) {
        return regulators.length;
    }

    // Return the i'th created proxy. The most recently created proxy will be at position getCount()-1.
    function getRegulatorProxy(uint256 i) public view returns(address) {
        require((i < regulators.length) && (i >= 0), "Invalid index");
        return regulators[i];
    }
}
