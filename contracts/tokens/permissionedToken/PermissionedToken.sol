pragma solidity ^0.4.24;

import "./dataStorage/PermissionedTokenStorage.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../helpers/Lockable.sol";
import "../../helpers/Pausable.sol";
import "../../regulator/Regulator.sol";

/**
* @title PermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator.
*/
contract PermissionedToken is ERC20, Pausable, Lockable {
    using SafeMath for uint256;

    /** Events */
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event ApprovedBlacklistedAddressSpender(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event ChangedRegulator(address indexed oldRegulator, address indexed newRegulator );

    PermissionedTokenStorage public tokenStorage;
    Regulator public regulator;

    /**
    * @dev create a new PermissionedToken with a brand new data storage
    **/
    constructor (address _regulator) public {
        regulator = Regulator(_regulator);
        tokenStorage = new PermissionedTokenStorage();
    }

    /** Modifiers **/

    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {
        require (regulator.hasUserPermission(msg.sender, msg.sig), "User does not have permission to execute function");
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

    /** Functions **/

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * must have minting authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to mint
    */
    function mint(address _to, uint256 _amount) public userNotBlacklisted(_to) requiresPermission whenNotPaused {
        _mint(_to, _amount);
    }

    /**
    * @notice Remove CUSD from supply
    * @param _amount The number of tokens to burn
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) userNotBlacklisted(msg.sender) public whenNotPaused {
        _burn(msg.sender, _amount);
    }

    /**
    * @notice Implements ERC-20 standard approve function. Locked or disabled by default to protect against
    * double spend attacks. To modify allowances, clients should call safer increase/decreaseApproval methods.
    * Upon construction, all calls to approve() will revert unless this contract owner explicitly unlocks approve()
    */
    function approve(address _spender, uint256 _value) 
    public userNotBlacklisted(_spender) userNotBlacklisted(msg.sender) whenNotPaused whenUnlocked returns (bool) {
        tokenStorage.setAllowance(msg.sender, _spender, _value);
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * @notice increaseApproval should be used instead of approve when the user's allowance
     * is greater than 0. Using increaseApproval protects against potential double-spend attacks
     * by moving the check of whether the user has spent their allowance to the time that the transaction 
     * is mined, removing the user's ability to double-spend
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint256 _addedValue) 
    public userNotBlacklisted(_spender) userNotBlacklisted(msg.sender) whenNotPaused returns (bool) {
        _increaseApproval(_spender, _addedValue, msg.sender);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * @notice decreaseApproval should be used instead of approve when the user's allowance
     * is greater than 0. Using decreaseApproval protects against potential double-spend attacks
     * by moving the check of whether the user has spent their allowance to the time that the transaction 
     * is mined, removing the user's ability to double-spend
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue) 
    public userNotBlacklisted(_spender) userNotBlacklisted(msg.sender) whenNotPaused returns (bool) {
        _decreaseApproval(_spender, _subtractedValue, msg.sender);
        return true;
    }

    /**
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who, uint256 _amount) public userBlacklisted(_who) whenNotPaused requiresPermission {
        tokenStorage.subBalance(_who, _amount);
        tokenStorage.subTotalSupply(_amount);
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
        tokenStorage.setAllowance(_blacklistedAccount, msg.sender, balanceOf(_blacklistedAccount));
        emit ApprovedBlacklistedAddressSpender(_blacklistedAccount, msg.sender, balanceOf(_blacklistedAccount));
    }

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the tranfer
    * will fail.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful 
    */
    function transfer(address _to, uint256 _amount) public userNotBlacklisted(_to) userNotBlacklisted(msg.sender) whenNotPaused returns (bool) {
        _transfer(_to, msg.sender, _amount);
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
    * @return `true` if successful 
    */
    function transferFrom(address _from, address _to, uint256 _amount) 
    public whenNotPaused transferFromConditionsRequired(_from, _to) returns (bool) {
        require(_amount <= allowance(_from, msg.sender),"not enough allowance to transfer");
        _transfer(_to, _from, _amount);
        tokenStorage.subAllowance(_from, msg.sender, _amount);
        return true;
    }

    /**
    *
    * @dev Only the token owner can change its regulator
    * @param _newRegulator the new Regulator for this token
    *
    */
    function setRegulator(address _newRegulator) public onlyOwner {
        require(_newRegulator != address(regulator), "Must be a new regulator");
        require(AddressUtils.isContract(_newRegulator), "Cannot set a regulator storage to a non-contract address");
        address old = address(regulator);
        regulator = Regulator(_newRegulator);
        emit ChangedRegulator(old, _newRegulator);
    }

    /**
    * @notice If a user is blacklisted, they will have the permission to 
    * execute this dummy function. This function effectively acts as a marker 
    * to indicate that a user is blacklisted. We include this function to be consistent with our
    * invariant that every possible userPermission (listed in Regulator) enables access to a single 
    * PermissionedToken function. Thus, the 'BLACKLISTED' permission gives access to this function
    * @return `true` if successful
    */
    function blacklisted() public view requiresPermission returns (bool) {
        return true;
    }

    /**
    * ERC20 standard functions
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return tokenStorage.allowances(owner, spender);
    }

    function totalSupply() public view returns (uint256) {
        return tokenStorage.totalSupply();
    }

    function balanceOf(address _addr) public view returns (uint256) {
        return tokenStorage.balances(_addr);
    }


    /** Internal functions **/
    
    function _decreaseApproval(address _spender, uint256 _subtractedValue, address _tokenHolder) internal {
        uint256 oldValue = allowance(_tokenHolder, _spender);
        if (_subtractedValue > oldValue) {
            tokenStorage.setAllowance(_tokenHolder, _spender, 0);
        } else {
            tokenStorage.subAllowance(_tokenHolder, _spender, _subtractedValue);
        }
        emit Approval(_tokenHolder, _spender, allowance(_tokenHolder, _spender));
    }

    function _increaseApproval(address _spender, uint256 _addedValue, address _tokenHolder) internal {
        tokenStorage.addAllowance(_tokenHolder, _spender, _addedValue);
        emit Approval(_tokenHolder, _spender, allowance(_tokenHolder, _spender));
    }

    function _burn(address _tokensOf, uint256 _amount) internal {
        require(_amount <= balanceOf(_tokensOf),"not enough balance to burn");
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        tokenStorage.subBalance(_tokensOf, _amount);
        tokenStorage.subTotalSupply(_amount);
        emit Burn(_tokensOf, _amount);
        emit Transfer(_tokensOf, address(0), _amount);
    }

    function _mint(address _to, uint256 _amount) internal {
        tokenStorage.addTotalSupply(_amount);
        tokenStorage.addBalance(_to, _amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }

    function _transfer(address _to, address _from, uint256 _amount) internal {
        require(_to != address(0),"to address cannot be 0x0");
        require(_amount <= balanceOf(_from),"not enough balance to transfer");

        tokenStorage.addBalance(_to, _amount);
        tokenStorage.subBalance(_from, _amount);
        emit Transfer(_from, _to, _amount);
    }

}