pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Regulator.sol";

/**
* @title RegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the PermissionedToken to the correct version of the Regulator
* service.
*
*/
contract RegulatorProxy is Ownable {
	
	/**
	* @notice Address of the latest `Regulator` us responsible for checking trade
	*         permissions.
	*/
	address public regulator;

	// Events

	event ReplaceRegulator(address oldRegulator, address newRegulator);

	// Methods

	/**
	* @notice Constructor sets a Regulator service
	* @param _regulator The address of the `Regulator' service
	*
	*/
	constructor (address _regulator) public {
		require(_regulator != address(0));
		regulator = _regulator;
	}

	/**
	* @dev Validate contract address
	* Credit: https://github.com/Dexaran/ERC223-token-standard/blob/Recommended/ERC223_Token.sol#L107-L114
	* @param _regulator The Regulator address
	*/
	modifier withContract(address _regulator) {
		uint length;
		assembly { length := extcodesize(_regulator) }
		require(length > 0);
		_;
	}

	/**
	* @notice Replaces the address pointer to the `RegulatorService`.
	* This method is only callable by the contract's owner
	* @param _regulator The new `Regulator` service
	*/
	function replaceService(address _regulator) public onlyOwner withContract(_regulator) {
		address oldRegulator = regulator;

		// TODO: Save regulator.attributes and regulator.validators

		regulator = _regulator;
		emit ReplaceRegulator(oldRegulator, regulator);
	}


	/**
	* @notice Queries the Regulator whether an account has a permission
	* @param _who the account to check 
	* @param _attribute the permission to check
	* @return 'true' if the check was successful and 'false' if unsuccessful
	*/
	function hasAttribute(address _who, string _attribute) public view returns (bool) {
		return Regulator(regulator).hasAttribute(_who, _attribute);
	}



}