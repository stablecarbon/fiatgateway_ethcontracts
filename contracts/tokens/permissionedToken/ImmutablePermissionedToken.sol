pragma solidity ^0.4.23;

import "../../regulator/Regulator.sol";
import "../../regulator/RegulatorProxy.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "./PermissionedToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

/**
* @title ImmutablePermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator.
*
* This token is NOT upgradeable. It is used as the basis for fiat-backed whitelisted tokens.
*
* Current responsibilities: 
* 	Anyone can transfer
*	Owner can mint, destroy blacklisted tokens
*	Depositors can burn
*/
contract ImmutablePermissionedToken is PermissionedToken, PausableToken, BurnableToken, MintableToken {
    /**
    * @notice Constructor sets the regulator proxy contract.
    * @param _rProxy Address of `RegulatorProxy` contract
    */
    constructor(address _rProxy) PermissionedToken(_rProxy) public {}

    /**
    * @notice Overrides mint() from `PermissionedToken`.
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        return super.mint(_to, _amount);
    }

    /**
    * @notice Overrides burn() from `PermissionedToken`.
    */
    function burn(uint256 _amount) public requiresPermission {
        super.burn(_amount);
    }

    /**
    * @notice Overrides destroyBlacklistedTokens() from `PermissionedToken`.
    */
    function destroyBlacklistedTokens(address _who) requiresPermission public {
        require(rProxy.isBlacklistedUser(_who));
        uint256 balance = balanceOf(_who);
        balances[_who] = 0;
        totalSupply_ = totalSupply_.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Overrides addBlacklistedAddressSpender() from `PermissionedToken`.
    */
    function addBlacklistedAddressSpender(address _who) requiresPermission public {
        require(rProxy.isBlacklistedUser(_who));
        uint256 balance = balanceOf(_who);
        allowed[_who][msg.sender] = balance;
        emit Approval(_who, msg.sender, balance);
    }

    /**
    * @notice Overrides transfer() from `PermissionedToken`.
    */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        if (rProxy.isBlacklistedUser(_to)) {
            // User is blacklisted, so they cannot initiate a transfer
            return false;
        }
        return super.transfer(_to, _amount);
    }

    /**
    * @notice Overrides transferFrom() from `PermissionedToken`.
    */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(balanceOf(_from) < _amount);
        
        bool is_recipient_blacklisted = rProxy.isBlacklistedUser(_to);
        require(!is_recipient_blacklisted);
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a validator that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = rProxy.isBlacklistedUser(_from);
        bytes4 add_blacklisted_spender_sig = rProxy.permissions().ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
        bool sender_can_spend_from_blacklisted_address = rProxy.hasUserPermission(msg.sender, add_blacklisted_spender_sig);
        bool sender_allowance_larger_than_transfer = allowance(_from, msg.sender) >= _amount;
        require(!is_origin_blacklisted || (sender_can_spend_from_blacklisted_address && sender_allowance_larger_than_transfer));

        super.transferFrom(_from, _to, _amount);
        return true;
    }
}