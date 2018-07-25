pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../../permissionedToken/PermissionedToken.sol";
import "../../../regulator/Regulator.sol";
import "./helpers/AllowanceSheet.sol";
import "./helpers/BalanceSheet.sol";

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
contract MutablePermissionedToken is PermissionedToken {
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
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Permissioned-Token specific
    event BalanceSheetSet(address indexed sheet);
    event AllowanceSheetSet(address indexed sheet);

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
    * @notice Implements balanceOf() as specified in the ERC20 standard.
    */
    function balanceOf(address _of) public view returns (uint256) {
        return balances.balanceOf(_of);
    }

    /**
    * @notice Implements allowance() as specified in the ERC20 standard.
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances.allowanceOf(owner, spender);
    }

    /**
    * @notice Overrides mint() from `PermissionedToken`.
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        return _mint(_to, _amount);
    }
    
    function _mint(address _to, uint256 _amount) userWhitelisted(_to) internal returns (bool) {
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
        _burn(msg.sender, _amount);
    }

    function _burn(address _tokensOf, uint256 _amount) internal {
        require(_amount <= balanceOf(_tokensOf),"not enough balance to burn");
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        /* uint burnAmount = _value / (10 **16) * (10 **16); */
        balances.subBalance(_tokensOf, _amount);
        totalSupply = totalSupply.sub(_amount);
        emit Burn(_tokensOf, _amount);
        emit Transfer(_tokensOf, address(0), _amount);
    }

    /**
    * @notice Implements approve() as specified in the ERC20 standard.
    */
    function approve(address _spender, uint256 _value) userNotBlacklisted(_spender) public returns (bool) {
        allowances.setAllowance(msg.sender, _spender, _value);
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
    * @notice Overrides destroyBlacklistedTokens() from `PermissionedToken`.
    */
    function destroyBlacklistedTokens(address _who) userBlacklisted(_who) requiresPermission public {
        uint256 balance = balanceOf(_who);
        balances.setBalance(_who, 0);
        totalSupply = totalSupply.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Overrides addBlacklistedAddressSpender() from `PermissionedToken`.
    */
    function addBlacklistedAddressSpender(address _who) userBlacklisted(_who) requiresPermission public {
        allowances.setAllowance(_who, msg.sender, balanceOf(_who));
        emit AddedBlacklistedAddressSpender(_who, msg.sender);
    }

    /**
    * @notice Overrides transfer() from `PermissionedToken`.
    */
    function transfer(address _to, uint256 _amount) transferConditionsRequired(_to) public returns (bool) {
        require(_to != address(0),"to address cannot be 0x0");
        require(_amount <= balanceOf(msg.sender),"not enough balance to transfer");

        balances.subBalance(msg.sender, _amount);
        balances.addBalance(_to, _amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
    * @notice Overrides transferFrom() from `PermissionedToken`.
    */
    function transferFrom(address _from, address _to, uint256 _amount) public transferFromConditionsRequired(_from, _to) returns (bool) {
        require(_amount <= allowance(_from, msg.sender),"not enough allowance to transfer");
        require(_to != address(0),"to address cannot be 0x0");
        require(_from != address(0),"from address cannot be 0x0");
        require(_amount <= balanceOf(_from),"not enough balance to transfer");
        
        allowances.subAllowance(_from, msg.sender, _amount);
        balances.addBalance(_to, _amount);
        balances.subBalance(_from, _amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }
}