pragma solidity ^0.4.23;

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
*
* @dev This token is not meant to be instantiated. Instantiate the derived contracts
* `ImmutablePermissionedToken` or `MutablePermissionedToken` instead.
*
*/
contract PermissionedToken is ERC20, Pausable, MutablePermissionedTokenStorage {event __CoveragePermissionedToken(string fileName, uint256 lineNumber);
event __FunctionCoveragePermissionedToken(string fileName, uint256 fnId);
event __StatementCoveragePermissionedToken(string fileName, uint256 statementId);
event __BranchCoveragePermissionedToken(string fileName, uint256 branchId, uint256 locationIdx);
event __AssertPreCoveragePermissionedToken(string fileName, uint256 branchId);
event __AssertPostCoveragePermissionedToken(string fileName, uint256 branchId);

    using SafeMath for uint256;

    /** Variables */
    uint256 public totalSupply;
    

    /** Events */
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event ApprovedBlacklistedAddressSpender(address indexed owner, address indexed spender, uint256 value);
    
    // ERC20
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);


    constructor (address regulator, address balances, address allowances) MutablePermissionedTokenStorage(regulator, balances, allowances) public {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',1);
}

    /** Modifiers */
    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',2);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',46);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',1);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',1);
require (regulator.hasUserPermission(msg.sender, msg.sig));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',1);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',47);
        _;
    }

    /** @notice Modifier that checks whether or not a transfer operation can send tokens to the
     * _to address. See transfer()'s documentation for
     * more details.
    **/
    modifier transferConditionsRequired(address _to) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',3);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',55);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',2);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',2);
require(!regulator.isBlacklistedUser(_to));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',2);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',56);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',3);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',3);
require(!regulator.isBlacklistedUser(msg.sender));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',3);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',57);
        _;
    }

     /** @notice Modifier that checks whether or not a transferFrom operation can
     * succeed with the given _from and _to address. See transferFrom()'s documentation for
     * more details.
    **/
    modifier transferFromConditionsRequired(address _from, address _to) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',4);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',65);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',4);
bool is_recipient_blacklisted = regulator.isBlacklistedUser(_to);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',66);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',4);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',5);
require(!is_recipient_blacklisted);emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',4);

        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a user that has been approved to transfer 
        // blacklisted tokens out of this address.
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',71);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',6);
bool is_origin_blacklisted = regulator.isBlacklistedUser(_from);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',72);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',7);
bool sender_can_spend_from_blacklisted_address = regulator.isBlacklistSpender(msg.sender); // Is the message sender a person with the ability to transfer tokens out of a blacklisted account?
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',73);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',5);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',8);
require(!is_origin_blacklisted || sender_can_spend_from_blacklisted_address);emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',5);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',74);
        _;
    }

    /** @notice Modifier that checks whether a user is whitelisted.
     * @param _user The address of the user to check.
    **/
    modifier userWhitelisted(address _user) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',5);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',81);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',6);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',9);
require(regulator.isWhitelistedUser(_user));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',6);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',82);
        _;
    }

    /** @notice Modifier that checks whether a user is blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userBlacklisted(address _user) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',6);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',89);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',7);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',10);
require(regulator.isBlacklistedUser(_user));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',7);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',90);
        _;
    }

    /** @notice Modifier that checks whether a user is not blacklisted.
     * @param _user The address of the user to check.
    **/
    modifier userNotBlacklisted(address _user) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',7);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',97);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',8);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',11);
require(!regulator.isBlacklistedUser(_user));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',8);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',98);
        _;
    }

    /** @notice Modifier that checks whether the caller of a function is not blacklisted.
    **/
    modifier senderNotBlacklisted() {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',8);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',104);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',9);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',12);
require(!regulator.isBlacklistedUser(msg.sender));emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',9);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',105);
        _;
    }

    /**
    * @notice Implements balanceOf() as specified in the ERC20 standard.
    */
    function balanceOf(address _of) public  returns (uint256) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',9);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',112);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',13);
return balances.balanceOf(_of);
    }

    /**
    * @notice Implements allowance() as specified in the ERC20 standard.
    */
    function allowance(address owner, address spender) public  returns (uint256) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',10);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',119);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',14);
return allowances.allowanceOf(owner, spender);
    }

    /**
    * @notice Implements totalSupply() as specified in the ERC20 standard.
    */
    function totalSupply() public  returns (uint256) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',11);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',126);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',15);
return totalSupply;
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * has to be some sort of centralized authority, e.g. PrimeTrust.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public requiresPermission returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',12);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',138);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',16);
return _mint(_to, _amount);
    }
    
    function _mint(address _to, uint256 _amount) userWhitelisted(_to) internal returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',13);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',142);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',17);
totalSupply = totalSupply.add(_amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',143);
        balances.addBalance(_to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',144);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',18);
emit Mint(_to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',145);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',19);
emit Transfer(address(0), _to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',146);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',20);
return true;
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * is just a "whitelisted" user (i.e. a user registered with the fiat gateway.)
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _amount The number of tokens to burn
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) public requiresPermission whenNotPaused {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',14);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',157);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',21);
_burn(msg.sender, _amount);
    }

    function _burn(address _tokensOf, uint256 _amount) internal {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',15);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',161);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',10);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',22);
require(_amount <= balanceOf(_tokensOf),"not enough balance to burn");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',10);

        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        /* uint burnAmount = _value / (10 **16) * (10 **16); */
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',165);
        balances.subBalance(_tokensOf, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',166);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',23);
totalSupply = totalSupply.sub(_amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',167);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',24);
emit Burn(_tokensOf, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',168);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',25);
emit Transfer(_tokensOf, address(0), _amount);
    }

    /**
    * @notice Implements approve() as specified in the ERC20 standard.
    */
    function approve(address _spender, uint256 _value) userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused public returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',16);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',175);
        allowances.setAllowance(msg.sender, _spender, _value);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',176);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',26);
emit Approval(msg.sender, _spender, _value);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',177);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',27);
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
    function increaseApproval(address _spender, uint _addedValue) userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused public returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',17);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',191);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',28);
increaseApprovalAllArgs(_spender, _addedValue, msg.sender);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',192);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',29);
return true;
    }

    function increaseApprovalAllArgs(address _spender, uint256 _addedValue, address _tokenHolder) internal {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',18);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',196);
        allowances.addAllowance(_tokenHolder, _spender, _addedValue);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',197);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',30);
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
    function decreaseApproval(address _spender, uint _subtractedValue) userNotBlacklisted(_spender) senderNotBlacklisted whenNotPaused public returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',19);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',211);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',31);
decreaseApprovalAllArgs(_spender, _subtractedValue, msg.sender);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',212);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',32);
return true;
    }

    function decreaseApprovalAllArgs(address _spender, uint256 _subtractedValue, address _tokenHolder) internal {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',20);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',216);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',33);
uint256 oldValue = allowances.allowanceOf(_tokenHolder, _spender);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',217);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',34);
if (_subtractedValue > oldValue) {emit __BranchCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',11,0);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',218);
            allowances.setAllowance(_tokenHolder, _spender, 0);
        } else {emit __BranchCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',11,1);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',220);
            allowances.subAllowance(_tokenHolder, _spender, _subtractedValue);
        }
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',222);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',35);
emit Approval(_tokenHolder, _spender, allowances.allowanceOf(_tokenHolder, _spender));
    }

    /**
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who, uint256 _amount) userBlacklisted(_who) whenNotPaused requiresPermission public {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',21);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',232);
        balances.subBalance(_who, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',233);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',36);
totalSupply = totalSupply.sub(_amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',234);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',37);
emit DestroyedBlacklistedTokens(_who, _amount);
    }
    /**
    * @notice Allows a central authority to approve themselves as a spender on a blacklisted account.
    * By default, the allowance is set to the balance of the blacklisted account, so that the
    * authority has full control over the account balance.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _blacklistedAccount The blacklisted account.
    */
    function approveBlacklistedAddressSpender(address _blacklistedAccount) whenNotPaused userBlacklisted(_blacklistedAccount) requiresPermission public {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',22);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',244);
        allowances.setAllowance(_blacklistedAccount, msg.sender, balanceOf(_blacklistedAccount));
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',245);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',38);
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
    function transfer(address _to, uint256 _amount) transferConditionsRequired(_to) whenNotPaused public returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',23);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',258);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',12);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',39);
require(_to != address(0),"to address cannot be 0x0");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',12);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',259);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',13);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',40);
require(_amount <= balanceOf(msg.sender),"not enough balance to transfer");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',13);


emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',261);
        balances.subBalance(msg.sender, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',262);
        balances.addBalance(_to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',263);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',41);
emit Transfer(msg.sender, _to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',264);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',42);
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
    function transferFrom(address _from, address _to, uint256 _amount) public whenNotPaused transferFromConditionsRequired(_from, _to) returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',24);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',280);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',14);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',43);
require(_amount <= allowance(_from, msg.sender),"not enough allowance to transfer");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',14);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',281);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',15);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',44);
require(_to != address(0),"to address cannot be 0x0");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',15);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',282);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',16);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',45);
require(_from != address(0),"from address cannot be 0x0");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',16);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',283);
        emit __AssertPreCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',17);
emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',46);
require(_amount <= balanceOf(_from),"not enough balance to transfer");emit __AssertPostCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',17);

        
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',285);
        allowances.subAllowance(_from, msg.sender, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',286);
        balances.addBalance(_to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',287);
        balances.subBalance(_from, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',288);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',47);
emit Transfer(_from, _to, _amount);
emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',289);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',48);
return true;
    }

    /**
    * @notice If a user is blacklisted, they will have the permission to 
    * execute this dummy function. This function effectively acts as a marker 
    * to indicate that a user is blacklisted.
    */
    function blacklisted() requiresPermission public  returns (bool) {emit __FunctionCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',25);

emit __CoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',298);
        emit __StatementCoveragePermissionedToken('/Users/tanishqaggarwal/Documents/carbon/fiat_gateway/contracts/tokens/permissionedToken/PermissionedToken.sol',49);
return true;
    }
}