pragma solidity ^0.4.24;

import "./dataStorage/MutablePermissionedTokenStorage.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
* @title PermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator.
*/
contract PermissionedToken is ERC20, Pausable, MutablePermissionedTokenStorage {
    using SafeMath for uint256;

    /** Events */
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event ApprovedBlacklistedAddressSpender(address indexed owner, address indexed spender, uint256 value);
    
    // ERC20
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);


    constructor (address r, address b, address a) 
    MutablePermissionedTokenStorage(r, b, a) public {}

    /** Modifiers */
    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {
        require (regulator.hasUserPermission(msg.sender, msg.sig), "User does not have permission to execute function");
        _;
    }

    /** @notice Modifier that checks whether or not a transfer operation can send tokens to the
     * _to address. See transfer()'s documentation for
     * more details.
    **/
    modifier transferConditionsRequired(address _to) {
        require(!regulator.isBlacklistedUser(_to), "Recipient cannot be blacklisted");
        require(!regulator.isBlacklistedUser(msg.sender), "Sender cannot be blacklisted");
        _;
    }

     /** @notice Modifier that checks whether or not a transferFrom operation can
     * succeed with the given _from and _to address. See transferFrom()'s documentation for
     * more details.
    **/
    modifier transferFromConditionsRequired(address _from, address _to) {
        require(!regulator.isBlacklistedUser(_to), "Recipient cannot be blacklisted");
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a user that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = regulator.isBlacklistedUser(_from);

        // Is the message sender a person with the ability to transfer tokens out of a blacklisted account?
        bool sender_can_spend_from_blacklisted_address = regulator.isBlacklistSpender(msg.sender);
        require(!is_origin_blacklisted || sender_can_spend_from_blacklisted_address, "Origin cannot be blacklisted if spender is not an approved blacklist spender");
        _;
    }

    /** @notice Modifier that checks whether a user is whitelisted.
     * @param _user The address of the user to check.
    **/
    modifier userWhitelisted(address _user) {
        require(regulator.isWhitelistedUser(_user), "User must be whitelisted");
        _;
    }

    /** @notice Modifier that checks whether a user is blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userBlacklisted(address _user) {
        require(regulator.isBlacklistedUser(_user), "User must be blacklisted");
        _;
    }

    /** @notice Modifier that checks whether a user is not blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userNotBlacklisted(address _user) {
        require(!regulator.isBlacklistedUser(_user), "User must not be blacklisted");
        _;
    }

    /** @notice Modifier that checks whether the caller of a function is not blacklisted.
    **/
    modifier senderNotBlacklisted() {
        require(!regulator.isBlacklistedUser(msg.sender), "Sender must not be blacklisted");
        _;
    }

    /**
    * @notice Implements balanceOf() as specified in the ERC20 standard.
    */
    function balanceOf(address who) public view returns (uint256) {
        return balances.balanceOf(who);
    }

    /**
    * @notice Implements allowance() as specified in the ERC20 standard.
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances.allowanceOf(owner, spender);
    }

    /**
    * @notice Implements totalSupply() as specified in the ERC20 standard.
    */
    function totalSupply() public view returns (uint256) {
        return balances.totalSupply();
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * has to be some sort of centralized authority, e.g. PrimeTrust.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {
        return _mint(_to, _amount);
    }
    
    function _mint(address _to, uint256 _amount) internal userWhitelisted(_to) returns (bool) {
        balances.addTotalSupply(_amount);
        balances.addBalance(_to, _amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * is just a "whitelisted" user (i.e. a user registered with the fiat gateway.)
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _amount The number of tokens to burn
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) public requiresPermission whenNotPaused {
        _burn(msg.sender, _amount);
    }

    function _burn(address _tokensOf, uint256 _amount) internal {
        require(_amount <= balanceOf(_tokensOf),"not enough balance to burn");
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        balances.subBalance(_tokensOf, _amount);
        balances.subTotalSupply(_amount);
        emit Burn(_tokensOf, _amount);
        emit Transfer(_tokensOf, address(0), _amount);
    }

    /**
    * @notice Implements approve() as specified in the ERC20 standard.
    */
    function approve(address _spender, uint256 _value) 
    public userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused returns (bool) {
        allowances.setAllowance(msg.sender, _spender, _value);
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint _addedValue) 
    public userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused returns (bool) {
        increaseApprovalAllArgs(_spender, _addedValue, msg.sender);
        return true;
    }

    function increaseApprovalAllArgs(address _spender, uint256 _addedValue, address _tokenHolder) internal {
        allowances.addAllowance(_tokenHolder, _spender, _addedValue);
        emit Approval(_tokenHolder, _spender, allowances.allowanceOf(_tokenHolder, _spender));
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint _subtractedValue) 
    public userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused returns (bool) {
        decreaseApprovalAllArgs(_spender, _subtractedValue, msg.sender);
        return true;
    }

    function decreaseApprovalAllArgs(address _spender, uint256 _subtractedValue, address _tokenHolder) internal {
        uint256 oldValue = allowances.allowanceOf(_tokenHolder, _spender);
        if (_subtractedValue > oldValue) {
            allowances.setAllowance(_tokenHolder, _spender, 0);
        } else {
            allowances.subAllowance(_tokenHolder, _spender, _subtractedValue);
        }
        emit Approval(_tokenHolder, _spender, allowances.allowanceOf(_tokenHolder, _spender));
    }

    /**
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who, uint256 _amount) public userBlacklisted(_who) whenNotPaused requiresPermission {
        balances.subBalance(_who, _amount);
        balances.subTotalSupply(_amount);
        emit DestroyedBlacklistedTokens(_who, _amount);
    }
    /**
    * @notice Allows a central authority to approve themselves as a spender on a blacklisted account.
    * By default, the allowance is set to the balance of the blacklisted account, so that the
    * authority has full control over the account balance.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _blacklistedAccount The blacklisted account.
    */
    function approveBlacklistedAddressSpender(address _blacklistedAccount) 
    public userBlacklisted(_blacklistedAccount) whenNotPaused requiresPermission {
        allowances.setAllowance(_blacklistedAccount, msg.sender, balanceOf(_blacklistedAccount));
        emit ApprovedBlacklistedAddressSpender(_blacklistedAccount, msg.sender, balanceOf(_blacklistedAccount));
    }

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @dev When implemented, it should use the transferConditionsRequired() modifier.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the tranfer
    * will fail.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transfer(address _to, uint256 _amount) public transferConditionsRequired(_to) whenNotPaused returns (bool) {
        require(_to != address(0),"to address cannot be 0x0");
        require(_amount <= balanceOf(msg.sender),"not enough balance to transfer");

        balances.subBalance(msg.sender, _amount);
        balances.addBalance(_to, _amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
    * @notice Initiates a transfer operation between address `_from` and `_to`. Requires that the
    * message sender is an approved spender on the _from account.
    * @dev When implemented, it should use the transferFromConditionsRequired() modifier.
    * @param _to The address of the recipient. This address must not be blacklisted.
    * @param _from The address of the origin of funds. This address _could_ be blacklisted, because
    * a regulator may want to transfer tokens out of a blacklisted account, for example.
    * In order to do so, the regulator would have to add themselves as an approved spender
    * on the account via `addBlacklistAddressSpender()`, and would then be able to transfer tokens out of it.
    * @param _amount The number of tokens to transfer
    * @return `true` if successful and `false` if unsuccessful
    */
    function transferFrom(address _from, address _to, uint256 _amount) 
    public whenNotPaused transferFromConditionsRequired(_from, _to) returns (bool) {
        require(_amount <= allowance(_from, msg.sender),"not enough allowance to transfer");
        require(_to != address(0),"to address cannot be 0x0");
        require(_amount <= balanceOf(_from),"not enough balance to transfer");
        
        allowances.subAllowance(_from, msg.sender, _amount);
        balances.addBalance(_to, _amount);
        balances.subBalance(_from, _amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
    * @notice If a user is blacklisted, they will have the permission to 
    * execute this dummy function. This function effectively acts as a marker 
    * to indicate that a user is blacklisted.
    */
    function blacklisted() public view requiresPermission returns (bool) {
        return true;
    }
}