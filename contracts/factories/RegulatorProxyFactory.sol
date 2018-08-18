pragma solidity ^0.4.24;

import "../regulator/RegulatorProxy.sol";
import "../regulator/mocks/PermissionSheetMock.sol";
import "../regulator/mocks/ValidatorSheetMock.sol";
import "../regulator/Regulator.sol";

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
        address permissions = address(new PermissionSheetMock()); // All permissions added
        address validators = address(new ValidatorSheetMock(msg.sender)); // Adds msg.sender as validator

        address proxy = address(new RegulatorProxy(regulatorImplementation, permissions, validators));

        // data storages should ultimately point be owned by the proxy, since it will delegate function
        // calls to the latest implementation *in the context of the proxy contract*
        PermissionSheet(permissions).transferOwnership(address(proxy));
        ValidatorSheet(validators).transferOwnership(address(proxy));
        Regulator(proxy).claimPermissionOwnership();
        Regulator(proxy).claimValidatorOwnership();

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
