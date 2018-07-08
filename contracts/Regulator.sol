pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the permissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is Ownable {
	/**
	* @notice Stores permission attributes for users. An example use case is an ERC20
    * token that requires its users to go through a KYC/AML check - in this case
    * a validator can set an account's "hasPassedKYC/AML" attribute to 1 to indicate
    * that account can use the token. This mapping stores that value (1, in the
    * example) as well as which validator last set the value and at what time,
    * so that e.g. the check can be renewed at appropriate intervals.
	*/
	mapping (address => mapping (string => AttributeData)) attributes;

	/**
	* @notice accounts with ability to set attributes
	*
	*/
	mapping (address => bool) validators;

	/**
	* @notice Attribute associated metadata
	*/
	struct AttributeData {
		uint256 value; // 0 if account does not have attribute
		string notes;
		address adminAddr; // address of admin who set the address
		uint256 timestamp; // block time stamp that attribute is set
	}

	// Modifiers

	/**
	* @notice Throws if called by any account that does not have access to set attributes
	*
	*/
	modifier onlyValidator() {
		require (validators[msg.sender]);
		_;
	}


	// Events
	event SetAttribute(address indexed who, string attribute, uint256 value, string notes, address indexed adminAddr, uint256 timestamp);
	event ValidatorAdded(address validator);
	event ValidatorRemoved(address validator);

	// Methods


	/**
	* @notice add a Validator
	* @param _validator Address of validator to add
	*/
	function addValidator(address _validator) public onlyOwner {
		validators[_validator] = true;
		emit ValidatorAdded(_validator);
	}

	/**
	* @notice remove a Validator
	* @param _validator Address of validator to remove
	*/
	function removeValidator(address _validator) public onlyOwner {
		validators[_validator] = false;
		emit ValidatorRemoved(_validator);
	}

	function isValidator(address _validator) public view returns (bool) {
		return validators[_validator];
	}
		
	/**
	* @notice Sets an attribute for an acccount. Only validators can add an attribute
	* @param _who The address of the account that we are setting the value of an attribute for
	* @param _attribute The attribute (eg. "KYC") in question
	* @param _value Whether the account has this attribute or not
	* @param _notes Additional metadata
	*/
	function setAttribute(address _who, string _attribute, uint256 _value, string _notes) public onlyValidator {
		attributes[_who][_attribute] = AttributeData(_value, _notes, msg.sender, block.timestamp);
		emit SetAttribute(_who, _attribute, _value, _notes, msg.sender, block.timestamp);
	}

	/**
	* @notice Checks whether an account has an attribute 
	* @param _who The address of the account that we are checking the value of an attribute for
	* @param _attribute The attribute (eg. "KYC") in question
	* @return A boolean to determine whether the account has the attribute
	*/
	function hasAttribute(address _who, string _attribute) public view returns (bool) {
		return attributes[_who][_attribute].value != 0;
	}

	/**
	* @notice Get attribute data of account's attribute
	* @param _who The address of the account that we are checking 
	* @param _attribute The attribute (eg. "KYC") in question
	* @return Tuple of AttributeData metadata
	*/
	function getAttribute(address _who, string _attribute) public view returns (uint256, string, address, uint256) {
		return (attributes[_who][_attribute].value, 
				attributes[_who][_attribute].notes,
				attributes[_who][_attribute].adminAddr,
				attributes[_who][_attribute].timestamp);
	}
}