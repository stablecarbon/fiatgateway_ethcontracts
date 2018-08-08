pragma solidity ^0.4.23;

import '../regulator/Regulator.sol';
import '../regulator/RegulatorProxy.sol';
import '../regulator/dataStorage/PermissionSheet.sol';
import '../regulator/dataStorage/ValidatorSheet.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';



/**
*
* @dev RegulatorFactory creates new Regulators preconfigured with with no validators and permission information stored 
* in its new data stores. The user can retrieve the most recently created Regulator
*
**/
contract RegulatorFactory is Ownable {

	address	permissions;
	address validators;
	address proxy;

	// Return most recently created permission storage address
	function getLatestPermissions() public view returns (address) {
		return permissions;
	}

	// Return most recently created validator storage address
	function getLatestValidators() public view returns (address) {
		return validators;
	}

	// Return most recently created Regulator address
	function getLatestRegulator() public view returns (address) {
		return proxy;
	}

	/**
	*
	* @dev generate a new regulator address that users can cast to either a RegulatorProxy or a Regulator.
	* The Regulator has the same logic as the regulatorImplementation input contract.
	* @param regulatorImplementation the address of the initial logic contract
	*
	**/
	function createRegulator(address regulatorImplementation) onlyOwner public {
		require(AddressUtils.isContract(regulatorImplementation), "Cannot set a proxy implementation to a non-contract address");
		
		// Store new data storage contracts for regulator
		permissions = address(new PermissionSheet());
		validators = address(new ValidatorSheet());

		// the user does not need to understand that the regulator is actually
		// a proxy pointing to a regulator model responsible for arranging of the data
		proxy = address(new RegulatorProxy(regulatorImplementation, permissions, validators));

		// data storages should ultimately point to the proxy, since it will delegate function
		// calls to the latest implementation in the context of the proxy contract. The proxy needs 
		// to be able to own its data movement
		PermissionSheet(permissions).transferOwnership(address(proxy));
		ValidatorSheet(validators).transferOwnership(address(proxy));
		RegulatorProxy(proxy).transferOwnership(msg.sender);
	}

}

