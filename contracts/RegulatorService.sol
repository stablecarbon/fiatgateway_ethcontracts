pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// Owner of this contract can update token-level settings
contract RegulatorService is Ownable {
	// Stores arbitrary attributes for users. An example use case is an ERC20
    // token that requires its users to go through a KYC/AML check - in this case
    // a validator can set an account's "hasPassedKYC/AML" attribute to 1 to indicate
    // that account can use the token. This mapping stores that value (1, in the
    // example) as well as which validator last set the value and at what time,
    // so that e.g. the check can be renewed at appropriate intervals.
	mapping (address => mapping (string => AttributeData)) private attributes;

	struct AttributeData {
		uint256 value;
		string notes;
		address adminAddr;
		uint256 timestamp;
	}

	// Events
	event SetAttribute(address indexed who, string attribute, uint256 value, string notes, address indexed adminAddr, uint256 timestamp);

	// Methods

	/**
	* @dev Sets an attribute for an acccount
	* @param _who The address of the account that we are setting the value of an attribute for
	* @param _attribute The attribute (eg. "KYC") in question
	* @param _value Whether the account has this attribute or not
	* @param _notes Additional metadata
	*/
	function setAttribute(address _who, string _attribute, uint256 _value, string _notes) onlyOwner public {
		attributes[_who][_attribute] = AttributeData(_value, _notes, msg.sender, block.timestamp);
		emit SetAttribute(_who, _attribute, _value, _notes, msg.sender, block.timestamp);
	}

	/**
	* @dev Checks whether an account has an attribute 
	* @param _who The address of the account that we are checking the value of an attribute for
	* @param _attribute The attribute (eg. "KYC") in question
	* @return A boolean to determine whether the account has the attribute
	*/
	function hasAttribute(address _who, string _attribute) public view returns (bool) {
		return attributes[_who][_attribute].value != 0;
	}
}