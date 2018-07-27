pragma solidity ^0.4.23;

import "./dataStorage/RegulatorStorage.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is RegulatorStorage, Ownable {

    /** 
        Modifiers 
    */
    /**
    * @notice Throws if called by any account that does not have access to set attributes
    */
    modifier onlyValidator() {
        require (isValidator(msg.sender));
        _;
    }

    /** 
        Events 
    */
    event SetWhitelistedUser(address indexed who);
    event SetBlacklistedUser(address indexed who);
    event SetNonlistedUser(address indexed who);


    /**
    * @notice Adds a validator to the regulator entity.
    * @param _who New validator.
    */
    function addValidator(address _who) public onlyOwner {
        super.addValidator(_who);
    }

    /**
    * @notice Removes a validator from the regulator entity.
    * @param _who Validator to remove.
    */
    function removeValidator(address _who) public onlyOwner {
        super.removeValidator(_who);
    }

    /** Returns whether or not a user is a validator.
     * @param _who The address of the account in question.
     * @return `true` if the user is a validator, `false` otherwise.
     */
    function isValidator(address _who) public view returns (bool) {
        return _isValidator[_who];
    }

    /**
    * @notice Sets the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        setUserPermission(_who, MINT_SIG);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        removeUserPermission(_who, MINT_SIG);
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasUserPermission(_who, MINT_SIG);
    }

    /**
    * @notice Sets the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistSpender(address _who) public onlyValidator {
        require(isPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG), "Blacklist spending not supported by token");
        setUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
    }
    
    /**
    * @notice Removes the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistSpender(address _who) public onlyValidator {
        require(isPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG), "Blacklist spending not supported by token");
        removeUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
    }

    /** Returns whether or not a user is a blacklist spender.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist spender, `false` otherwise.
     */
    function isBlacklistSpender(address _who) public view returns (bool) {
        return hasUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
    }

    /**
    * @notice Sets the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistDestroyer(address _who) public onlyValidator {
        require(isPermission(DESTROY_BLACKLISTED_TOKENS_SIG), "Blacklist token destruction not supported by token");
        setUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistDestroyer(address _who) public onlyValidator {
        require(isPermission(DESTROY_BLACKLISTED_TOKENS_SIG), "Blacklist token destruction not supported by token");
        removeUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
    }

    /** Returns whether or not a user is a blacklist destroyer.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist destroyer, `false` otherwise.
     */
    function isBlacklistDestroyer(address _who) public view returns (bool) {
        return hasUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
    }

    /**
    * @notice Sets the necessary permissions for a "whitelisted" user.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setWhitelistedUser(address _who) public onlyValidator {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        setUserPermission(_who, BURN_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit SetWhitelistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "blacklisted" user. A blacklisted user has their accounts
    * frozen; they cannot transfer, burn, or withdraw any tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistedUser(address _who) public onlyValidator {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        removeUserPermission(_who, BURN_SIG);
        setUserPermission(_who, BLACKLISTED_SIG);
        emit SetBlacklistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "nonlisted" user. Nonlisted users can trade tokens,
    * but cannot burn them (and therefore cannot convert them into fiat.)
    * @param _who The address of the account that we are setting permissions for.
    */
    function setNonlistedUser(address _who) public onlyValidator {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        removeUserPermission(_who, BURN_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit SetNonlistedUser(_who);
    }

    /** Returns whether or not a user is whitelisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is whitelisted, `false` otherwise.
     */
    function isWhitelistedUser(address _who) public view returns (bool) {
        return (hasUserPermission(_who, BURN_SIG) && !hasUserPermission(_who, BLACKLISTED_SIG));
    }

    /** Returns whether or not a user is blacklisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is blacklisted, `false` otherwise.
     */
    function isBlacklistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, BURN_SIG) && hasUserPermission(_who, BLACKLISTED_SIG));
    }

    /** Returns whether or not a user is nonlisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is nonlisted, `false` otherwise.
     */
    function isNonlistedUser(address _who) public view returns (bool) {
        return (!hasUserPermission(_who, BURN_SIG) && !hasUserPermission(_who, BLACKLISTED_SIG));
    }
        
    /**
    * @notice Sets a permission for an acccount. Only validators can set a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user is getting permission to run.
    */
    function setUserPermission(address _who, bytes4 _methodsignature) public onlyValidator {
        super.setUserPermission(_who, _methodsignature);
    }
 
    /**
    * @notice Removes a permission for an acccount. Only validators can remove a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user will no longer be able to execute.
    */
    function removeUserPermission(address _who, bytes4 _methodsignature) public onlyValidator {
        super.removeUserPermission(_who, _methodsignature);
    }

    /**
    * @notice Checks whether an account has the permission to execute a function
    * @param _who The address of the account
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the user has permission or not
    */
    function hasUserPermission(address _who, bytes4 _methodsignature) public view returns (bool) {
        return _hasUserPermission[_who][_methodsignature];
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
    onlyValidator public {
        super.addPermission(_methodsignature, _permissionName, _permissionDescription, _contractName);
    }

    function getPermission(bytes4 _methodsignature) public view returns
            (string name, 
            string description, 
            string contract_name) {
        return (permissions[_methodsignature].name, permissions[_methodsignature].description, permissions[_methodsignature].contract_name);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) public onlyValidator {
        super.removePermission(_methodsignature);
    }

    /**
    * @notice Checks whether a method signature is a valid permission
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the permission is valid or not
    */
    function isPermission(bytes4 _methodsignature) public view returns (bool) {
        return _isPermission[_methodsignature];
    }
}