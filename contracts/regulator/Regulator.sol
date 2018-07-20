pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "zos-lib/contracts/migrations/Migratable.sol";
import "./PermissionsStorage.sol";
import "./ValidatorStorage.sol";
import "../DataMigratable.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is Claimable, Migratable, DataMigratable {
    /** STORAGES
    */

    /** 
    * @notice The list of possible permissions, as well as which users
    * have what permissions.
    */
    PermissionsStorage public permissions;

    /**
    * @notice Accounts with ability to set permissions.
    *
    */
    ValidatorStorage public validators;

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
    event SetPermissionsStorage(address indexed oldStorage, address indexed newStorage);
    event SetValidatorStorage(address indexed oldStorage, address indexed newStorage);
    event SetMinter(address indexed who);
    event RemovedMinter(address indexed who);
    event SetBlacklistSpender(address indexed who);
    event RemovedBlacklistSpender(address indexed who);
    event SetBlacklistDestroyer(address indexed who);
    event RemovedBlacklistDestroyer(address indexed who);
    event SetWhitelistedUser(address indexed who);
    event SetBlacklistedUser(address indexed who);
    event SetNonlistedUser(address indexed who);

    /**
    * @notice Function used as part of Migratable interface. Must be called when
    * a proxy is assigned to contract in order to correctly assign the contract's
    * version number.
    *
    * If deploying a new contract version, the version number must be changed as well. 
    */
    function initialize() isInitializer("Regulator", "1.0") public {
        // Nothing to initialize!
    }

    /** @notice Migrates data from an old regulator contract to a new one. Precondition: 
    *  the new contract has already been transferred ownership of the old contract.
    *   @param _oldRegulator The address of the old regulator. 
    */
    function migrate(address _oldRegulator) isMigration("Regulator", "1.0", "1.1") public {
        Regulator r = Regulator(_oldRegulator);
        r.claimOwnership(); // Take the proferred ownership of the old contract
        r.transferStorageOwnership();
        setPS(r.permissions());
        setVS(r.validators());
        claimSO();
    }

    /**
    * @notice Sets the internal permission storage to point to a new storage.
    * @param _newStorage The address of a new PermissionsStorage.
    */
    function setPermissionsStorage(address _newStorage) external onlyOwner {
        setPS(_newStorage);
    }

    // Allows the migrate function to set the storage.
    function setPS(address _newStorage) internal {
        address _oldStorage = address(permissions);
        permissions = PermissionsStorage(_newStorage);
        emit SetPermissionsStorage(_oldStorage, _newStorage);
    }

    /**
    * @notice Sets the internal validators storage to point to a new storage.
    * @param _newStorage The address of a new ValidatorStorage.
    */
    function setValidatorStorage(address _newStorage) external onlyOwner {
        setVS(_newStorage);
    }

    // Allows the migrate function to set the storage.
    function setVS(address _newStorage) internal {
        address _oldStorage = address(validators);
        validators = ValidatorStorage(_newStorage);
        emit SetValidatorStorage(_oldStorage, _newStorage);
    }

    /** @notice Transfers ownership of the storage contracts to the owner  of this token contract. 
    * This is useful for migrations, since the new token contract is made the
    * owner of the old token contract.
    **/
    function transferSO(address owner) internal {
        permissions.transferOwnership(owner);
        validators.transferOwnership(owner);
    }

    /** @notice Claims ownership of the storage contracts. Succeeds if the
    * ownership of those contracts was transferred to this contract
    * (which will happen in the case of a migration).
    **/
    function claimSO() internal {
        permissions.claimOwnership();
        validators.claimOwnership();
    }

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

    /** Returns whether or not a user is a validator.
     * @param _who The address of the account in question.
     * @return `true` if the user is a validator, `false` otherwise.
     */
    function isValidator(address _who) public view returns (bool) {
        return validators.isValidator(_who);
    }

    /**
    * @notice Sets the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        setUserPermission(_who, permissions.MINT_SIG());
        emit SetMinter(_who);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeMinter(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.MINT_SIG()), "Minting not supported by token");
        removeUserPermission(_who, permissions.MINT_SIG());
        emit RemovedMinter(_who);
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.MINT_SIG());
    }

    /**
    * @notice Sets the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistSpender(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG()), "Blacklist spending not supported by token");
        setUserPermission(_who, permissions.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG());
        emit SetBlacklistSpender(_who);
    }
    
    /**
    * @notice Removes the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistSpender(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG()), "Blacklist spending not supported by token");
        removeUserPermission(_who, permissions.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG());
        emit RemovedBlacklistSpender(_who);
    }

    /** Returns whether or not a user is a blacklist spender.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist spender, `false` otherwise.
     */
    function isBlacklistSpender(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG());
    }

    /**
    * @notice Sets the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistDestroyer(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.DESTROY_BLACKLISTED_TOKENS_SIG()), "Blacklist token destruction not supported by token");
        setUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
        emit SetBlacklistDestroyer(_who);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistDestroyer(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.DESTROY_BLACKLISTED_TOKENS_SIG()), "Blacklist token destruction not supported by token");
        removeUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
        emit RemovedBlacklistDestroyer(_who);
    }

    /** Returns whether or not a user is a blacklist destroyer.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist destroyer, `false` otherwise.
     */
    function isBlacklistDestroyer(address _who) public view returns (bool) {
        return hasUserPermission(_who, permissions.DESTROY_BLACKLISTED_TOKENS_SIG());
    }

    /**
    * @notice Sets the necessary permissions for a "whitelisted" user.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setWhitelistedUser(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        setUserPermission(_who, permissions.BURN_SIG());
        removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetWhitelistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "blacklisted" user. A blacklisted user has their accounts
    * frozen; they cannot transfer, burn, or withdraw any tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistedUser(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        removeUserPermission(_who, permissions.BURN_SIG());
        setUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetBlacklistedUser(_who);
    }

    /**
    * @notice Sets the necessary permissions for a "nonlisted" user. Nonlisted users can trade tokens,
    * but cannot burn them (and therefore cannot convert them into fiat.)
    * @param _who The address of the account that we are setting permissions for.
    */
    function setNonlistedUser(address _who) public onlyValidator {
        require(permissions.isPermission(permissions.BURN_SIG()), "Burn method not supported by token");
        require(permissions.isPermission(permissions.BLACKLISTED_SIG()), "Self-destruct method not supported by token");
        removeUserPermission(_who, permissions.BURN_SIG());
        removeUserPermission(_who, permissions.BLACKLISTED_SIG());
        emit SetNonlistedUser(_who);
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
    * @notice Checks whether an account has the permission to execute a function
    * @param _who The address of the account
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the user has permission or not
    */
    function hasUserPermission(address _who, bytes4 _methodsignature) public view returns (bool) {
        return permissions.hasUserPermission(_who, _methodsignature);
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
        permissions.addPermission(_methodsignature, _permissionName, _permissionDescription, _contractName);
    }

    function getPermission(bytes4 _methodsignature) public view returns (
            string name, 
            string description, 
            string contract_name) {
        return permissions.permissions(_methodsignature);
    }

    /**
    * @notice Removes a permission the list of permissions.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(bytes4 _methodsignature) public onlyValidator {
        permissions.removePermission(_methodsignature);
    }

    /**
    * @notice Checks whether a method signature is a valid permission
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the permission is valid or not
    */
    function isPermission(bytes4 _methodsignature) public view returns (bool) {
        return permissions.isPermission(_methodsignature);
    }
}