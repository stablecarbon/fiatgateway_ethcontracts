pragma solidity ^0.4.23;

import "./RegulatorProxy.sol";
import "./DepositorBasedToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../modularERC20/ModularBurnableToken.sol";
import "../modularERC20/ModularMintableToken.sol";
import "../modularERC20/ModularPausibleToken.sol";


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
contract PermissionedToken is Ownable, ModularPausableToken, ModularBurnableToken, ModularMintableToken  {
    /**
    * @notice Address of the `RegulatorProxy` that points to the latest
    *         `Regulator` contract responsible for checking and applying trade
    *         permissions.
    */
    RegulatorProxy public regulator;

    event DestroyBlacklistedTokens(address account, uint256 amount);

    /**
    * @notice Constructor sets the regulator that determines account permissions
    * @param _regulatorProxy Address of `RegulatorProxy` contract
    */
    constructor (address _regulatorProxy) public {
        require(AddressUtils.isContract(_regulatorProxy));
        regulator = RegulatorProxy(_regulatorProxy);
    }

    modifier requiresPermission() {
        require (regulator.hasPermission(msg.sender, msg.sig));
        _;
    }

    /**
    * @notice overridden function that include logic to check whether account can withdraw tokens.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        super.mint(_to, _amount);
    }

    /**
    * @notice overridden function that include logic to check whether account can deposit tokens.
    * @param _amount The number of tokens to burn
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function _burn(uint256 _amount) public requiresPermission returns (bool) {
        super.burn(_amount);
        return true;
    }

    /**
    * @notice destroy the tokens owned by an account
    * @param _who account to destroy tokens from
    */
    function destroyBlacklistedTokens(address _who) public requiresPermission {
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