pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "./dataStorage/MutableRegulatorStorage.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is MutableRegulatorStorage {
    /** 
        Modifiers 
    */
    /**
    * @notice Throws if called by any account that does not have access to set attributes
    */
    modifier onlyValidator() {
        require (isValidator(msg.sender), "Sender must be validator");
        _;
    }

    /** 
        Events 
    */
    event LogWhitelistedUser(address indexed who);
    event LogBlacklistedUser(address indexed who);
    event LogNonlistedUser(address indexed who);
    event LogSetMinter(address indexed who);
    event LogRemovedMinter(address indexed who);
    event LogSetBlacklistDestroyer(address indexed who);
    event LogRemovedBlacklistDestroyer(address indexed who);
    event LogSetBlacklistSpender(address indexed who);
    event LogRemovedBlacklistSpender(address indexed who);


    /**
    * @notice CONSTRUCTOR
    * @param _permissionSheetAddress initial permission sheet
    * @param _validatorSheetAddress initial validator sheet
    **/
    constructor (address _permissionSheetAddress, address _validatorSheetAddress ) public MutableRegulatorStorage(_permissionSheetAddress, _validatorSheetAddress) {}

    /**
    * @notice Adds a validator to the regulator entity.
    * @param _who New validator.
    */
    function addValidator(address _who) public onlyOwner {
        validators.addValidator(_who);
    }

    /**
    * @notice Removes a validator from the regulator entity.
    * @param _who Validator to remove.
    */
    function removeValidator(address _who) public onlyOwner {
        validators.removeValidator(_who);
    }

    /**
    * @notice Sets the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        _setMinter(_who);
    }

    /**
    * @notice Removes the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        _removeMinter(_who);
    }

    /**
    * @notice Sets the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistSpender(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG()), "Blacklist spending not supported by token");
        permissions.setUserPermission(_who, permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG());
        emit LogSetBlacklistSpender(_who);
    }
    
    /**
    * @notice Removes the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistSpender(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG()), "Blacklist spending not supported by token");
        permissions.removeUserPermission(_who, permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG());
        emit LogRemovedBlacklistSpender(_who);
    }

    /**
    * @notice Sets the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistDestroyer(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.DESTROY_BLACKLISTED_TOKENS_SIG()), "Blacklist token destruction not supported by token");
        permissions.setUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
        emit LogSetBlacklistDestroyer(_who);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistDestroyer(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.DESTROY_BLACKLISTED_TOKENS_SIG()), "Blacklist token destruction not supported by token");
        permissions.removeUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
        emit LogRemovedBlacklistDestroyer(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "whitelisted" user.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setWhitelistedUser(address _who) public onlyValidator {
        _setWhitelistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "blacklisted" user. A blacklisted user has their accounts
    * frozen; they cannot transfer, burn, or withdraw any tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistedUser(address _who) public onlyValidator {
        _setBlacklistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "nonlisted" user. Nonlisted users can trade tokens,
    * but cannot burn them (and therefore cannot convert them into fiat.)
    * @param _who The address of the account that we are setting permissions for.
    */
    function setNonlistedUser(address _who) public onlyValidator {
        _setNonlistedUser(_who);
    }
        
    /**
    * @notice Sets a permission for an acccount. Only validators can set a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user is getting permission to run.
    */
    function setUserPermission(address _who, bytes4 _methodsignature) public onlyValidator {
        permissions.setUserPermission(_who, _methodsignature);
    }
 
    /**
    * @notice Removes a permission for an acccount. Only validators can remove a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user will no longer be able to execute.
    */
    function removeUserPermission(address _who, bytes4 _methodsignature) public onlyValidator {
        permissions.removeUserPermission(_who, _methodsignature);
    }

    /**
    * @notice Sets a permission within the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    * @param _permissionName A "slug" name for this permission (e.g. "canMint").
    * @param _permissionDescription A lengthier description for this permission (e.g. "Allows user to mint tokens").
    * @param _contractName Name of the contract that the method belongs to.
    */
    function addPermission(
        bytes4 _methodsignature, 
        string _permissionName, 
        string _permissionDescription,
        string _contractName) 
    public onlyValidator {
        permissions.addPermission(_methodsignature, _permissionName, _permissionDescription, _contractName);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) public onlyValidator {
        permissions.removePermission(_methodsignature);
    }

    /** Returns whether or not a user is a validator.
     * @param _who The address of the account in question.
     * @return `true` if the user is a validator, `false` otherwise.
     */
    function isValidator(address _who) public view returns (bool) {
        return validators.isValidator(_who);
    }

    function getPermission(bytes4 _methodsignature) public view returns
            (string name, 
            string description, 
            string contract_name) {
        return (permissions.permissions(_methodsignature));
    }

    /**
    * @notice Checks whether a method signature is a valid permission
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the permission is valid or not
    */
    function isPermission(bytes4 _methodsignature) public view returns (bool) {
        return permissions.isPermission(_methodsignature);
    }

    /**
    * @notice Checks whether an account has the permission to execute a function
    * @param _who The address of the account
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the user has permission or not
    */
    function hasUserPermission(address _who, bytes4 _methodsignature) public view returns (bool) {
        return permissions.hasUserPermission(_who,_methodsignature);
    }

    /** Returns whether or not a user is whitelisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is whitelisted, `false` otherwise.
     */
    function isWhitelistedUser(address _who) public view returns (bool) {
        return (hasUserPermission(_who, permissions.BURN_SIG()) && !hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }

    /** Returns whether or not a user is blacklisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is blacklisted, `false` otherwise.
     */
    function isBlacklistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, permissions.BURN_SIG()) && hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }

    /** Returns whether or not a user is nonlisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is nonlisted, `false` otherwise.
     */
    function isNonlistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, permissions.BURN_SIG()) && !hasUserPermission(_who, permissions.BLACKLISTED_SIG()));
    }

    /** Returns whether or not a user is a blacklist spender.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist spender, `false` otherwise.
     */
    function isBlacklistSpender(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG());
    }

    /** Returns whether or not a user is a blacklist destroyer.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist destroyer, `false` otherwise.
     */
    function isBlacklistDestroyer(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.MINT_SIG());
    }

    /** Internal Functions **/

    function _setMinter(address _who) internal {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        permissions.setUserPermission(_who, permissions.MINT_SIG());
        emit LogSetMinter(_who);
    }

    function _removeMinter(address _who) internal {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        permissions.removeUserPermission(_who, permissions.MINT_SIG());
        emit LogRemovedMinter(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        permissions.removeUserPermission(_who, permissions.BURN_SIG());
        permissions.removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit LogNonlistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        permissions.removeUserPermission(_who, permissions.BURN_SIG());
        permissions.setUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit LogBlacklistedUser(_who);
    }

    function _setWhitelistedUser(address _who) internal {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        permissions.setUserPermission(_who, permissions.BURN_SIG());
        permissions.removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit LogWhitelistedUser(_who);
    }
}