pragma solidity ^0.4.23;

import "../regulator/Regulator.sol";
import "../regulator/RegulatorProxy.sol";
import "../modularERC20/ModularPausableToken.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "zos-lib/contracts/migrations/Migratable.sol";


// TODO Convert to EternalERC20.

/**
* @title MutablePermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator
*
* This token is upgradeable, in contrast with ImmutablePermissionedToken.
*
* Current responsibilities: 
* 	Anyone can transfer 
*	Owner can mint, destroy blacklisted tokens
*	Depositors can burn
*/
contract MutablePermissionedToken is Claimable, Migratable, ModularPausableToken {
    /**
    * @notice Address of `RegulatorProxy` that points to the latest
    *         `Regulator` contract responsible for checking and applying trade
    *         permissions.
    */
    address public rProxy;

    /** Events */
    event ChangedRegulatorProxy(address oldProxy, address newProxy);
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event UserDestroyedSelf(address indexed user, uint256 balance_before_destruction);

    /** Modifiers */

    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {
        require (Regulator(rProxy).hasPermission(msg.sender, msg.sig));
        _;
    }

    /**
    * @notice Constructor sets the regulator proxy contract.
    * @param _rProxy Address of `RegulatorProxy` contract
    */
    constructor(address _rProxy) Ownable() public {
        setRP(_rProxy);
    }

    /**
    * @notice Function used as part of Migratable interface. Must be called when
    * proxy is assigned to contract in order to correctly assign the contract's
    * version number.
    *
    * If deploying a new contract version, the version number must be changed as well. 
    */
    function initialize() isInitializer("MutablePermissionedToken", "1.0") public {
        // Nothing to initialize!
    }

    /** @notice Migrates data from an old token contract to a new one.
    * Precondition: the new contract has already been transferred ownership of the old contract.
    *
    * If deploying a new contract version, updating the version numbers is necessary if you
    * wish to run the migration.
    * @param _oldToken The address of the old token contract. 
    */
    function migrate(address _oldToken) isMigration("MutablePermissionedToken", "1.0", "1.1") public {
        MutablePermissionedToken oldToken = MutablePermissionedToken(_oldToken);
        oldToken.claimOwnership(); // Take the proferred ownership of the old contract
        oldToken.transferStorageOwnership();
        setBalanceSheet(address(oldToken.balances()));
        setAllowanceSheet(address(oldToken.allowances()));
        claimStorageOwnership();
    }

    /** @notice Transfers ownership of the balance and allowance sheets to the owner
    * of this token contract. This is useful for migrations, since the new token contract is made the
    * owner of the old token contract.
    **/
    function transferStorageOwnership() onlyOwner public {
        balances.transferOwnership(msg.sender);
        allowances.transferOwnership(msg.sender);
    }

    /** @notice Claims ownership of the balance and allowance sheets. Succeeds if the
    * ownership of those contracts was transferred to this contract.
    *
    * This function is strictly used for migrations.
    **/
    function claimStorageOwnership() internal {
        balances.claimOwnership();
        allowances.claimOwnership();
    }

    /**
    * @notice Sets the address of the currently used regulator proxy
    * @param _rProxy Address of new `RegulatorProxy` contract
    */
    function setRegulatorProxy(address _rProxy) public onlyOwner {
        setRP(_rProxy);
    }

    // Function so that constructor can also set the regulator proxy.
    function setRP(address _rProxy) internal {
        require(AddressUtils.isContract(_rProxy));
        address oldProxy = rProxy;
        rProxy = _rProxy;
        emit ChangedRegulatorProxy(oldProxy, _rProxy);
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * has to be some sort of centralized authority, e.g. PrimeTrust.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        return super.mint(_to, _amount);
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * is just a "whitelisted" user (i.e. a user registered with the fiat gateway.)
    * @param _amount The number of tokens to burn
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) public requiresPermission returns (bool) {
        return super.burn(_amount, "");
    }

    /**
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who) requiresPermission public {
        require(Regulator(rProxy).isBlacklistedUser(_who));
        uint256 balance = balances.balanceOf(_who);
        balances.setBalance(_who, 0);
        totalSupply_ = totalSupply_.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Allows a central authority to add themselves as a spender on a blacklisted account.
    * By default, the allowance is set to the balance of the blacklisted account, so that the
    * authority has full control over the account balance.
    * @param _who The blacklisted account.
    */
    function addBlacklistedAddressSpender(address _who) requiresPermission public {
        require(Regulator(rProxy).isBlacklistedUser(_who));
        approveAllArgs(msg.sender, balances.balanceOf(_who), _who);
    }

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the tranfer
    * will fail.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        if (Regulator(rProxy).isBlacklistedUser(_to)) {
            // User is blacklisted, so they cannot initiate a transfer
            return false;
        }
        return super.transfer(_to, _amount);
    }

    /**
    * @notice Initiates a transfer operation between address `_from` and `_to`.
    *
    * @param _to The address of the recipient. This address must not be blacklisted.
    * @param _from The address of the origin of funds. This address _could_ be blacklisted, because
    * a regulator may want to transfer tokens out of a blacklisted account, for example.
    * In order to do so, the regulator would have to add themselves as an approved spender
    * on the account via `addBlacklistAddressSpender()`, and would then be able to transfer tokens out of it.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(balances.balanceOf(_from) < _amount);
        
        bool is_recipient_blacklisted = Regulator(rProxy).isBlacklistedUser(_to);
        require(!is_recipient_blacklisted);
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a validator that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = Regulator(rProxy).isBlacklistedUser(_from);
        bytes4 add_blacklisted_spender_sig = Regulator(rProxy).ADD_BLACKLISTED_SPENDER_SIG();
        bool sender_can_spend_from_blacklisted_address = Regulator(rProxy).hasPermission(msg.sender, add_blacklisted_spender_sig);
        bool sender_allowance_larger_than_transfer = allowance(_from, msg.sender) >= _amount;
        require(!is_origin_blacklisted || (sender_can_spend_from_blacklisted_address && sender_allowance_larger_than_transfer));

        transferFromAllArgs(_from, _to, _amount, msg.sender);
        return true;
    }

    /**
    * @notice If a user is blacklisted, then they will have the ability to 
    * destroy their own tokens. This function provides that ability.
    */
    function destroySelf() requiresPermission public returns (bool) {
        uint256 balance = balanceOf(msg.sender);
        balances.setBalance(msg.sender, 0);
        totalSupply_.sub(balance);
        emit UserDestroyedSelf(msg.sender, balance);
    }
}