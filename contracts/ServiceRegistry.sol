pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RegulatorService.sol";

// @notice A service that points to a Regulator Service
contract ServiceRegistry is Ownable {
	RegulatorService public service;

	// Events

	/**
	* @notice Triggered when service address is replaced
	*/
	// event ReplaceService(address oldService, address newService);

	// Methods

	constructor (RegulatorService _service) public {
		require(_service != address(0));
		service = _service;
	}

	/**
	* @notice Replaces the address pointer to the `RegulatorService`
	*
	* @dev This method is only callable by the contract's owner
	*
	* @param _service The new `RegulatorService`
	*/
	// function replaceService(address _service) onlyOwner public {
	// 	address oldService = service;
	// 	service = _service;
	// 	emit ReplaceService(oldService, service);
	// }



}