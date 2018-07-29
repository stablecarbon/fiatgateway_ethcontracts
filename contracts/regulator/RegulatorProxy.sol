pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol";
import "./dataStorage/MutableRegulatorStorageConsumer.sol";

contract RegulatorProxy is UpgradeabilityProxy, MutableRegulatorStorageConsumer {

	constructor( address _implementation, address _regulatorStorage ) UpgradeabilityProxy( _implementation ) MutableRegulatorStorageConsumer(_regulatorStorage) public {}

	/**
	* @dev Upgrade the backing implementation of the proxy.
	* Only the admin can call this function.
	* @param newImplementation Address of the new implementation.
	*/
	function upgradeTo(address newImplementation) onlyOwner public {
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
	function upgradeToAndCall(address newImplementation, bytes data) payable onlyOwner public {
		_upgradeTo(newImplementation);
		require(address(this).call.value(msg.value)(data));
	}

  	/**
    * @return The address of the implementation.
    */
	function implementation() onlyOwner public view returns (address) {
		return _implementation();
	}


}