pragma solidity ^0.4.23;

import "./RegulatorService.sol";
import "./ServiceRegistry.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


/**
 * @title Permissioned Token
 * @dev A token that is self-regulates
 *
 */
contract PermissionedToken is Ownable, PausableToken, BurnableToken, MintableToken {
	
	// Passes KYC & AML and therefore can redeem CarbonUSD and mint new CarbonUSD for USD
	string constant WHITELISTED = "whitelist";
	// User has an ERC20 wallet and can transfer, but still needs to pass KYC & AML to burn or mint
	string constant NONLISTED = "nonlisted";
	// Cannot transfer, burn, or mint
	string constant BLACKLISTED = "blacklisted";

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
	* @dev Constructor sets the Service registry that determines account permissions
	* @param _registry Address of `ServiceRegistry` contract
	*/
	constructor (ServiceRegistry _registry) public {
		require(_registry != address(0));
		registry = _registry;
	}

	function check(address _who, string _attribute) public view returns (bool) {
		return RegulatorService(registry.service()).hasAttribute(_who, _attribute);
	}

	// Overriden Methods that include logic to check for action validity

	function mint(address _to, uint256 _amount) onlyOwner public returns (bool) {
		require(check(msg.sender, WHITELISTED), "account is not allowed to mint");
		emit PassChecks(WHITELISTED, msg.sender);
		super.mint(_to, _amount);
	}

	function burn(uint256 _amount) public {
		require(check(msg.sender, WHITELISTED), "account is not allowed to burn");
		emit PassChecks(WHITELISTED, msg.sender);
		super.burn(_amount);
	}

	function transfer(address _to, uint256 _amount) public returns (bool) {
		require(!check(msg.sender, BLACKLISTED), "sender is blacklisted");
		require(!check(_to, BLACKLISTED), "receiver is blacklisted");
		super.transfer(_to, _amount);
	}

	function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
		require(!check(_from, BLACKLISTED), "sender is blacklisted");
		require(!check(_to, BLACKLISTED), "receiver is blacklisted");
		super.transferFrom(_from, _to, _amount);
	}

}