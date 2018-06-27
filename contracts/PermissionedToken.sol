pragma solidity ^0.4.23;

import "./CreateRedeemToken.sol";
import "./RegulatorService.sol";
import "./ServiceRegistry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract PermissionedToken is Ownable, CreateRedeemToken {
	string constant CAN_DEPOSIT_USD = "canDeposit";
	string constant CAN_REDEEM = "canRedeem";
	string constant CAN_CREATE = "canCreate";
	string constant CAN_TRANSFER = "canTransfer";

	/**
	* @notice Address of the `ServiceRegistry` that has the location of the
	*         `RegulatorService` contract responsible for checking trade
	*         permissions.
	*/
	ServiceRegistry public registry;

	// Events
	  
	/**
	* @notice Triggered when regulator checks pass 
	*/
	event PassChecks(string attribute, address indexed account);

	// New Methods

	/**
	* @dev Owner sets the Service registry that determines whether account can transfer, redeem, create
	* @param _registry Address of `ServiceRegistry` contract
	*/
	function setRegistry(ServiceRegistry _registry) onlyOwner public {
		require(_registry != address(0));
		registry = _registry;
	}

	function check(address _who, string _attribute) public view returns (bool) {
		return RegulatorService(registry.service()).hasAttribute(_who, _attribute);
	}

	// Overriden Methods that include logic to check for action validity

	function addFiatCredits(address _to, uint256 _amount) onlyOwner public returns (bool) {
		require(check(_to, CAN_DEPOSIT_USD), "account does not have canDeposit attribute");
		emit PassChecks(CAN_DEPOSIT_USD, _to);
		super.addFiatCredits(_to, _amount);
	}

	function create(uint256 _amount) public {
		require(check(msg.sender, CAN_CREATE), "account does not have canCreate attribute");
		emit PassChecks(CAN_CREATE, msg.sender);
		super.create(_amount);
	}

	function burn(uint256 _amount) public {
		require(check(msg.sender, CAN_REDEEM), "account does not have canRedeem attribute");
		emit PassChecks(CAN_REDEEM, msg.sender);
		super.burn(_amount);
	}

	function transfer(address _to, uint256 _amount) public returns (bool) {
		require(check(msg.sender, CAN_TRANSFER), "sender does not have canTransfer attribute)");
		require(check(_to, CAN_TRANSFER), "receiver does not have canTransfer attribute)");
		emit PassChecks(CAN_TRANSFER, msg.sender);
		emit PassChecks(CAN_TRANSFER, _to);
		super.transfer(_to, _amount);
	}

	function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
		require(check(_from, CAN_TRANSFER), "sender does not have canTransfer attribute)");
		require(check(_to, CAN_TRANSFER), "receiver does not have canTransfer attribute)");
		emit PassChecks(CAN_TRANSFER, _from);
		emit PassChecks(CAN_TRANSFER, _to);
		super.transferFrom(_from, _to, _amount);
	}

}