pragma solidity ^0.4.23;

import "./RegulatorProxy.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


/**
* @title Permissioned Token
* @dev A permissioned token that enables transfers, withdrawals, and deposits to occur if and only
* if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator
*
* Current responsibilities: 
* 	Anyone can transfer 
*	Owner can mint, destroy blacklisted tokens
*	Depositors can burn
*/
contract PermissionedToken is Ownable, PausableToken, BurnableToken, MintableToken {
	
	// ASSUMPTION: account can only have one status at any given time

	// Passes KYC & AML and therefore can mint new tokens
	string constant WHITELISTED = "whitelist";
	// User has an ERC20 wallet and can transfer, but still needs to pass KYC & AML to burn or mint
	string constant NONLISTED = "nonlisted";
	// Cannot transfer, burn, or mint
	string constant BLACKLISTED = "blacklisted";

	/**
	* @notice Address of the `RegulatorProxy` that points to the latest
	*         `Regulator` contract responsible for checking trade
	*         permissions.
	*/
	RegulatorProxy public regulatorProxy;

	/**
	* @notice accounts with ability to burn and deposit tokens
	*
	*/
	mapping(address => bool) depositAccounts;

	// Modifiers

	/**
	* @notice Throws if called by any account that does not have deposit access
	*
	*/
	modifier onlyDepositor() {
		require (isDepositor(msg.sender));
		_;
	}

	// Events
	event DepositorAdded(address depositor);
	event DepositorRemoved(address depositor);
	event DestroyBlacklistedTokens(address account, uint256 amount);

	// Methods

	/**
	* @notice Constructor sets the RegulatorProxy that determines account permissions
	* @param _regulatorProxy Address of `RegulatorProxy` contract
	*/
	constructor (address _regulatorProxy) public {
		require(_regulatorProxy != address(0));
		regulatorProxy = RegulatorProxy(_regulatorProxy);
	}

	/**
	* @notice Add a depositor who has access to burn tokens
	* @param _depositor Address to add
	*/
	function addDepositor(address _depositor) public onlyOwner {
		depositAccounts[_depositor] = true;
		emit DepositorAdded(_depositor);
	}

	/**
	* @notice Remove a depositor who has access to burn tokens
	* @param _depositor Address to remove
	*/
	function removeDepositor(address _depositor) public onlyOwner {
		depositAccounts[_depositor] = false;
		emit DepositorRemoved(_depositor);
	}

	function isDepositor(address _depositor) public view returns (bool) {
		return depositAccounts[_depositor];
	}

	/**
	* @notice Performs the regulator check
	* @param _who the account to check 
	* @param _attribute the permission to check
	*
	* @return 'true' if the check was successful and 'false' if unsuccessful
	*/
	function check(address _who, string _attribute) private view returns (bool) {
		return regulatorProxy.hasAttribute(_who, _attribute);
	}

	/**
	* @notice overridden function that include logic to check whether account can withdraw tokens.
	* @param _to The address of the receiver
	* @param _amount The number of tokens to withdraw
	*
	* @return `true` if successful and `false` if unsuccessful
	*/
	function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
		require(check(_to, WHITELISTED), "account is not allowed to mint");
		super.mint(_to, _amount);
	}

	/**
	* @notice overridden function that include logic to check whether account can deposit tokens.
	* @param _amount The number of tokens to burn
	*
	* @return `true` if successful and `false` if unsuccessful
	*/
	function _burn(uint256 _amount) public onlyDepositor returns (bool) {
		require(check(msg.sender, WHITELISTED), "account is not allowed to burn");
		super.burn(_amount);
		return true;
	}

	/**
	* @notice destroy the tokens owned by a blacklisted account
	* @param _who account to destroy tokens from
	*/
	function destroyBlacklistedTokens(address _who) public onlyOwner {
		require(check(_who, BLACKLISTED), "account is not blacklisted");
		uint256 oldAmount = balanceOf(_who);
		balances[_who] = balances[_who].sub(oldAmount);
		totalSupply_ = totalSupply_.sub(oldAmount);
		emit DestroyBlacklistedTokens(_who, oldAmount);
	}

	/**
	* @notice overridden function that includes logic to check for trade validity.
	* @param _to The address of the receiver
	* @param _amount The number of tokens to transfer
	*
	* @return `true` if successful and `false` if unsuccessful
	*/
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