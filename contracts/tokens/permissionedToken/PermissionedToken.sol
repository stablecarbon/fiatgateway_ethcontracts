pragma solidity ^0.4.23;

import "../../regulator/Regulator.sol";
import "./helpers/AllowanceSheet.sol";
import "./helpers/BalanceSheet.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title PermissionedToken
* @notice A permissioned token that enables transfers, withdrawals, and deposits to occur 
* if and only if it is approved by an on-chain Regulator service. PermissionedToken is an
* ERC-20 smart contract representing ownership of securities and overrides the
* transfer, burn, and mint methods to check with the Regulator.
*
* @dev This token is not meant to be instantiated. Instantiate the derived contracts
* `ImmutablePermissionedToken` or `MutablePermissionedToken` instead.
*
*/
contract PermissionedToken is Claimable {
    using SafeMath for uint256;

    /** Variables */
    // Allowance and balance storage classes
    uint256 public totalSupply;
    AllowanceSheet public allowances;
    BalanceSheet public balances;
    
    /**
    * @notice `Regulatoregulator` that points to the latest
    *         `Regulator` contract responsible for checking and applying trade
    *         permissions.
    */
    Regulator public regulator;

    /** Events */
    event ChangedRegulatoregulator(address oldProxy, address newProxy);
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event AddedBlacklistedAddressSpender(address indexed account, address indexed spender);
    // ERC20
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /** Modifiers */
    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {
        require (regulator.hasUserPermission(msg.sender, msg.sig));
        _;
    }

    /** @notice Modifier that checks whether or not a transfer operation can send tokens to the
     * _to address. See transfer()'s documentation for
     * more details.
    **/
    modifier transferConditionsRequired(address _to) {
        require(!regulator.isBlacklistedUser(_to));
        _;
    }

     /** @notice Modifier that checks whether or not a transferFrom operation can
     * succeed with the given _from and _to address. See transferFrom()'s documentation for
     * more details.
    **/
    modifier transferFromConditionsRequired(address _from, address _to) {
        bool is_recipient_blacklisted = regulator.isBlacklistedUser(_to);
        require(!is_recipient_blacklisted);
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a user that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = regulator.isBlacklistedUser(_from);
        bool sender_can_spend_from_blacklisted_address = regulator.isBlacklistSpender(msg.sender); // Is the message sender a person with the ability to transfer tokens out of a blacklisted account?
        require(!is_origin_blacklisted || sender_can_spend_from_blacklisted_address);
        _;
    }

    /** @notice Modifier that checks whether a user is whitelisted.
     * @param _user The address of the user to check.
    **/
    modifier userWhitelisted(address _user) {
        require(regulator.isWhitelistedUser(_user));
        _;
    }

    /** @notice Modifier that checks whether a user is blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userBlacklisted(address _user) {
        require(regulator.isBlacklistedUser(_user));
        _;
    }

    /** @notice Modifier that checks whether a user is not blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userNotBlacklisted(address _user) {
        require(!regulator.isBlacklistedUser(_user));
        _;
    }

    /** @notice Modifier that checks whether the caller of a function is not blacklisted.
    **/
    modifier senderNotBlacklisted() {
        require(!regulator.isBlacklistedUser(msg.sender));
        _;
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
    * @notice Sets the address of the currently used regulator proxy
    * @param _regulator Address of new `Regulator` contract
    */
    function setRegulator(address _regulator) public onlyOwner {
        _setRegulator(_regulator);
    }

    // Function so that constructor can also set the regulator proxy.
    function _setRegulator(address _regulator) internal {
        require(AddressUtils.isContract(_regulator));
        address oldRegulator = address(regulator);
        regulator = Regulator(_regulator);
        emit ChangedRegulatoregulator(oldRegulator, _regulator);
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
    
    function _mint(address _to, uint256 _amount) userWhitelisted(_to) internal returns (bool) {
        totalSupply = totalSupply.add(_amount);
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
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who) userBlacklisted(_who) requiresPermission public {
        uint256 balance = balanceOf(_who);
        balances.setBalance(_who, 0);
        totalSupply = totalSupply.sub(balance);
        emit DestroyedBlacklistedTokens(_who, balance);
    }

    /**
    * @notice Allows a central authority to add themselves as a spender on a blacklisted account.
    * By default, the allowance is set to the balance of the blacklisted account, so that the
    * authority has full control over the account balance.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who The blacklisted account.
    */
    function addBlacklistedAddressSpender(address _who, address _spender) userBlacklisted(_who) requiresPermission public {
        allowances.setAllowance(_who, _spender, balanceOf(_who));
        emit AddedBlacklistedAddressSpender(_who, _spender);
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
    function transfer(address _to, uint256 _amount) transferConditionsRequired(_to) public returns (bool) {
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

    /**
    * @notice Iff a user is blacklisted, they will have the permission to 
    * execute this dummy function. This function effectively acts as a marker 
    * to indicate that a user is blacklisted.
    */
    function blacklisted() requiresPermission public view returns (bool) {
        return true;
    }
}