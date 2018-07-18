pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "zos-lib/contracts/migrations/Migratable.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../../regulator/Regulator.sol";
import "../../regulator/RegulatorProxy.sol";
import "./AllowanceSheet.sol";
import "./BalanceSheet.sol";
import "../../DataMigratable.sol";

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
contract MutablePermissionedToken is Migratable, DataMigratable, PermissionedToken {
    using SafeMath for uint256;

    /** Variables */
    // Allowance and balance storage classes
    uint256 public totalSupply;
    AllowanceSheet public allowances;
    BalanceSheet public balances;

    /** Events */
    // ERC20
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Permissioned-Token specific
    event BalanceSheetSet(address indexed sheet);
    event AllowanceSheetSet(address indexed sheet);

    /**
    * @notice Constructor sets the regulator proxy contract.
    * @param _rProxy Address of `RegulatorProxy` contract
    */
    constructor(address _rProxy) PermissionedToken(_rProxy) public {}

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
        claimSO();
    }

    /** @notice Transfers ownership of the balance and allowance sheets to the owner
    * of this token contract. This is useful for migrations, since the new token contract is made the
    * owner of the old token contract.
    **/
    function transferSO(address owner) internal {
        balances.transferOwnership(owner);
        allowances.transferOwnership(owner);
    }

    /** @notice Claims ownership of the balance and allowance sheets. Succeeds if the
    * ownership of those contracts was transferred to this contract.
    *
    * This function is strictly used for migrations.
    **/
    function claimSO() internal {
        balances.claimOwnership();
        allowances.claimOwnership();
    }

    /**
    * @dev Claim ownership of the AllowanceSheet contract
    * @param _sheet The address to of the AllowanceSheet to claim.
    */
    function setAllowanceSheet(address _sheet) public onlyOwner returns(bool){
        allowances = AllowanceSheet(_sheet);
        allowances.claimOwnership();
        emit AllowanceSheetSet(_sheet);
        return true;
    }

    /**
    * @dev Claim ownership of the BalanceSheet contract
    * @param _sheet The address to of the BalanceSheet to claim.
    */
    function setBalanceSheet(address _sheet) public onlyOwner returns(bool){
        balances = BalanceSheet(_sheet);
        balances.claimOwnership();
        emit BalanceSheetSet(_sheet);
        return true;
    }

    /**
    * @notice Overrides mint() from `PermissionedToken`.
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        totalSupply = totalSupply.add(_amount);
        balances.addBalance(_to, _amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
    * @notice Overrides burn() from `PermissionedToken`.
    */
    function burn(uint256 _amount) public requiresPermission {
        require(_amount <= balances.balanceOf(msg.sender),"not enough balance to burn");
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        /* uint burnAmount = _value / (10 **16) * (10 **16); */
        balances.subBalance(msg.sender, _amount);
        totalSupply = totalSupply.sub(_amount);
        emit Burn(msg.sender, _amount);
        emit Transfer(msg.sender, address(0), _amount);
    }

    /**
    * @notice Overrides destroyBlacklistedTokens() from `PermissionedToken`.
    */
    function destroyBlacklistedTokens(address _who) requiresPermission public {
        require(rProxy.isBlacklistedUser(_who));
        uint256 balance = balances.balanceOf(_who);
        balances.setBalance(_who, 0);
        totalSupply = totalSupply.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Overrides addBlacklistedAddressSpender() from `PermissionedToken`.
    */
    function addBlacklistedAddressSpender(address _who) requiresPermission public {
        require(rProxy.isBlacklistedUser(_who));
        allowances.setAllowance(_who, msg.sender, balances.balanceOf(_who));
    }

    /**
    * @notice Overrides transfer() from `PermissionedToken`.
    */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        if (rProxy.isBlacklistedUser(_to)) {
            // User is blacklisted, so they cannot initiate a transfer
            return false;
        }
        balances.subBalance(msg.sender, _amount);
        balances.addBalance(_to, _amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
    * @notice Overrides transferFrom() from `PermissionedToken`.
    */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        require(_amount <= allowances.allowanceOf(_from, msg.sender),"not enough allowance to transfer");
        require(_to != address(0),"to address cannot be 0x0");
        require(_from != address(0),"from address cannot be 0x0");
        require(_amount <= balances.balanceOf(_from),"not enough balance to transfer");
        
        bool is_recipient_blacklisted = rProxy.isBlacklistedUser(_to);
        require(!is_recipient_blacklisted);
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a validator that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = rProxy.isBlacklistedUser(_from);
        bytes4 add_blacklisted_spender_sig = rProxy.permissions().ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
        bool sender_can_spend_from_blacklisted_address = rProxy.hasUserPermission(msg.sender, add_blacklisted_spender_sig);
        bool sender_allowance_larger_than_transfer = allowances.allowanceOf(_from, msg.sender) >= _amount;
        require(!is_origin_blacklisted || (sender_can_spend_from_blacklisted_address && sender_allowance_larger_than_transfer));

        allowances.subAllowance(_from, msg.sender, _amount);
        balances.addBalance(_to, _amount);
        balances.subBalance(_from, _amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }
}