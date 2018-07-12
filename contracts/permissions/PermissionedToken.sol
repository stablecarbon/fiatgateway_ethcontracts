pragma solidity ^0.4.23;

import "./Regulator.sol";
import "./RegulatorProxy.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "zos-lib/contracts/migrations/Migratable.sol";
import "../modularERC20/ModularBurnableToken.sol";
import "../modularERC20/ModularMintableToken.sol";
import "../modularERC20/ModularPausableToken.sol";


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
contract PermissionedToken is Claimable, Migratable, ModularPausableToken {
    /**
    * @notice Address of `RegulatorProxy` that points to the latest
    *         `Regulator` contract responsible for checking and applying trade
    *         permissions.
    */
    address public rProxy;

    /**
    * @notice Constructor sets the regulator that determines account permissions
    * @param _rProxy Address of `RegulatorProxy` contract
    */
    constructor(address _rProxy) Ownable() public {
        setRegulatorProxy(_rProxy);
    }

    function initialize() isInitializer("PermissionedToken", "1.0") public {
        // Nothing to initialize!
    }

    /** @dev Migrates data from an old token contract to a new one.
        Precondition: the new contract has already been transferred ownership of the old contract.
        @param _oldToken The address of the old token contract. */
    function migrate(address _oldToken) isMigration("PermissionedToken", "1.0", "1.1") public {
        PermissionedToken oldToken = PermissionedToken(_oldToken);
        oldToken.claimOwnership(); // Take the proferred ownership of the old contract
        oldToken.transferStorageOwnership();
        setBalanceSheet(address(oldToken.balances()));
        setAllowanceSheet(address(oldToken.allowances()));
        claimStorageOwnership();
    }

    function transferStorageOwnership() onlyOwner public {
        balances.transferOwnership(msg.sender);
        allowances.transferOwnership(msg.sender);
    }

    function claimStorageOwnership() internal {
        balances.claimOwnership();
        allowances.claimOwnership();
    }

    modifier requiresPermission() {
        require (Regulator(rProxy).hasPermission(msg.sender, msg.sig));
        _;
    }

    event ChangedRegulatorProxy(address oldProxy, address newProxy);
    /**
    * @notice Sets the address of the currently used regulator proxy
    * @param _rProxy Address of new `RegulatorProxy` contract
    */
    function setRegulatorProxy(address _rProxy) public onlyOwner {
        require(AddressUtils.isContract(_rProxy));
        address oldProxy = rProxy;
        rProxy = _rProxy;
        emit ChangedRegulatorProxy(oldProxy, _rProxy);
    }

    /**
    * @notice overridden function that include logic to check whether account can withdraw tokens.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        super.mint(_to, _amount);
        return true;
    }

    /**
    * @notice overridden function that include logic to check whether account can deposit tokens.
    * @param _amount The number of tokens to burn
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) public requiresPermission returns (bool) {
        super.burn(_amount, "");
        return true;
    }

    event DestroyedBlacklistedTokens(address account, uint256 amount);
    /**
    * @notice destroy the tokens owned by an account
    * @param _who account to destroy tokens from
    */
    function destroyBlacklistedTokens(address _who) requiresPermission public {
        require(Regulator(rProxy).hasPermission(_who, bytes4(keccak256("destroySelf()")))); // User must be blacklisted
        uint256 balance = balances.balanceOf(_who);
        balances.setBalance(_who, 0);
        totalSupply_ = totalSupply_.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        if (Regulator(rProxy).hasPermission(_to, bytes4(keccak256("destroySelf()")))) {
            // User is blacklisted, so they cannot initiate a transfer
            return false;
        }
        super.transfer(_to, _amount);
        return true;
    }

    /**
    * @notice Initiates a transfer operation between address `_from` and `_to`.
    *
    * @param _to The address of the receiver
    * @param _from The address of the sender
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(balances.balanceOf(_from) < _amount);
        if (! Regulator(rProxy).hasPermission(_to, bytes4(keccak256("destroySelf()")))) {
            // If _to user is not blacklisted (doesn't have the ability to destroy themselves), then 
            // we allow the transaction to continue.
            transferFromAllArgs(_from, _to, _amount, msg.sender);
            return true;
        }
        return false;
    }

    /**
    * @notice If a user is blacklisted, then they will have the ability to 
    * destroy their own tokens. This function provides that ability.
    */
    event UserDestroyedSelf(address indexed user, uint256 balance_before_destruction);
    function destroySelf() requiresPermission public returns (bool) {
        uint256 balance = balanceOf(msg.sender);
        balances.setBalance(msg.sender, 0);
        totalSupply_.sub(balance);
        emit UserDestroyedSelf(msg.sender, balance);
    }

}