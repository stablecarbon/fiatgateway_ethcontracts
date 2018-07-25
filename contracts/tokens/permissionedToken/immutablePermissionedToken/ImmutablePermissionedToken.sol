pragma solidity ^0.4.23;

import "../../../regulator/Regulator.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../PermissionedToken.sol";
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
    * @notice Overrides mint() from `PermissionedToken`.
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        return _mint(_to, _amount);
    }

    function _mint(address _to, uint256 _amount) internal returns (bool) {
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
    function transfer(address _to, uint256 _amount) public transferConditionsRequired(_to) returns (bool) {
        return super.transfer(_to, _amount);
    }

    /**
    * @notice Overrides transferFrom() from `PermissionedToken`.
    */
    function transferFrom(address _from, address _to, uint256 _amount) public transferFromConditionsRequired(_from, _to) returns (bool) {
        super.transferFrom(_from, _to, _amount);
        return true;
    }
}