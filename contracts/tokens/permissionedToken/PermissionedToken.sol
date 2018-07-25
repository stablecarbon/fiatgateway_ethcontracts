pragma solidity ^0.4.23;

import "../../regulator/Regulator.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";


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
    /**
    * @notice `RegulatorProxy` that points to the latest
    *         `Regulator` contract responsible for checking and applying trade
    *         permissions.
    */
    Regulator public rProxy;

    /** Events */
    event ChangedRegulatorProxy(address oldProxy, address newProxy);
    event DestroyedBlacklistedTokens(address indexed account, uint256 amount);
    event AddedBlacklistedAddressSpender(address indexed account, address indexed spender);

    /** Modifiers */
    /** @notice Modifier that allows function access to be restricted based on
    * whether the regulator allows the message sender to execute that function.
    **/
    modifier requiresPermission() {
        require (rProxy.hasUserPermission(msg.sender, msg.sig));
        _;
    }

    /** @notice Modifier that checks whether or not a transfer operation can send tokens to the
     * _to address. See transfer()'s documentation for
     * more details.
    **/
    modifier transferConditionsRequired(address _to) {
        require(!rProxy.isBlacklistedUser(_to));
        _;
    }

     /** @notice Modifier that checks whether or not a transferFrom operation can
     * succeed with the given _from and _to address. See transferFrom()'s documentation for
     * more details.
    **/
    modifier transferFromConditionsRequired(address _from, address _to) {
        bool is_recipient_blacklisted = rProxy.isBlacklistedUser(_to);
        require(!is_recipient_blacklisted);
        
        // If the origin user is blacklisted, the transaction can only succeed if 
        // the message sender is a user that has been approved to transfer 
        // blacklisted tokens out of this address.
        bool is_origin_blacklisted = rProxy.isBlacklistedUser(_from);
        bytes4 add_blacklisted_spender_sig = rProxy.permissions().ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
        bool sender_can_spend_from_blacklisted_address = 
            rProxy.hasUserPermission(msg.sender, add_blacklisted_spender_sig); // Is the message sender a person with the ability to transfer tokens out of a blacklisted account?
        require(!is_origin_blacklisted || sender_can_spend_from_blacklisted_address);
        _;
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
        address oldProxy = address(rProxy);
        rProxy = Regulator(_rProxy);
        emit ChangedRegulatorProxy(oldProxy, _rProxy);
    }

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * has to be some sort of centralized authority, e.g. PrimeTrust.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount) public returns (bool);

    /**
    * @notice Allows user to mint if they have the appropriate permissions. User generally
    * is just a "whitelisted" user (i.e. a user registered with the fiat gateway.)
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _amount The number of tokens to burn
    * @return `true` if successful and `false` if unsuccessful
    */
    function burn(uint256 _amount) public;

    /**
    * @notice Destroy the tokens owned by a blacklisted account. This function can generally
    * only be called by a central authority.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who Account to destroy tokens from. Must be a blacklisted account.
    */
    function destroyBlacklistedTokens(address _who) public;

    /**
    * @notice Allows a central authority to add themselves as a spender on a blacklisted account.
    * By default, the allowance is set to the balance of the blacklisted account, so that the
    * authority has full control over the account balance.
    * @dev Should be access-restricted with the 'requiresPermission' modifier when implementing.
    * @param _who The blacklisted account.
    */
    function addBlacklistedAddressSpender(address _who) public;

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @dev When implemented, it should use the transferConditionsRequired() modifier.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the tranfer
    * will fail.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful and `false` if unsuccessful
    */
    function transfer(address _to, uint256 _amount) public transferConditionsRequired(_to) returns (bool) {}

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
    function transferFrom(address _from, address _to, uint256 _amount) public transferFromConditionsRequired(_from, _to) returns (bool) {}

    /**
    * @notice If a user is blacklisted, then they will have the ability to 
    * destroy their own tokens. This function provides that ability.
    */
    function blacklisted() requiresPermission public view returns (bool) {
        return true;
    }
}