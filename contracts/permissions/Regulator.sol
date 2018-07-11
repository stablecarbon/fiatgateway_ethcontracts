pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PermissionStorage.sol";
import "./UserPermissionsStorage.sol";
import "./ValidatorStorage.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is Ownable {
    /** 
    * @notice Stores a mapping from method signatures to permission attributes (e.g. whether
      the permission is "activated" for use, and additional attributes such as the
      method's name and location in the code.)
    */
    PermissionStorage public availablePermissions;

    /** 
    * @notice Stores a mapping from users to execution permissions that they hold.
    */
    UserPermissionsStorage public userPermissions;

    /**
    * @notice accounts with ability to set attributes
    *
    */
    ValidatorStorage validators;

    /**
    * @notice Throws if called by any account that does not have access to set attributes
    *
    */
    modifier onlyValidator() {
        require (validators.isValidator(msg.sender));
        _;
    }

    // Events
    event SetPermissionStorage(address oldStorage, address newStorage);
    function setPermissionStorage(address _newStorage) public onlyOwner {
        address _oldStorage = address(availablePermissions);
        availablePermissions = PermissionStorage(_newStorage);
        emit SetPermissionStorage(_oldStorage, _newStorage);
    }

    event SetUserPermissionsStorage(address oldStorage, address newStorage);
    function setUserPermissionsStorage(address _newStorage) public onlyOwner {
        address _oldStorage = address(userPermissions);
        userPermissions = UserPermissionsStorage(_newStorage);
        emit SetUserPermissionsStorage(_oldStorage, _newStorage);
    }

    bytes4 MINT_SIG = bytes4(keccak256("mint(address,uint256)"));
    bytes4 DESTROYBLACKLIST_SIG = bytes4(keccak256("destroyBlacklistedTokens(address)"));
    /**
    * @notice Sets the necessary permissions for a user to mint tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setMinter(address _who) public onlyValidator {
        require(availablePermissions.isPermission(MINT_SIG), "Minting not supported by token");
        userPermissions.setPermission(_who, MINT_SIG);
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasPermission(_who, MINT_SIG);
    }

    bytes4 DESTROYSELF_SIG = bytes4(keccak256("destroySelf()"));
    bytes4 BURN_SIG = bytes4(keccak256("burn(uint256)"));
    /**
    * @notice Sets the necessary permissions for a "whitelisted" user.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setWhitelistedUser(address _who) public onlyValidator {
        require(availablePermissions.isPermission(BURN_SIG), "Burn method not supported by token");
        require(availablePermissions.isPermission(DESTROYSELF_SIG), "Self-destruct method not supported by token");
        userPermissions.setPermission(_who, BURN_SIG);
        userPermissions.removePermission(_who, DESTROYSELF_SIG);
    }

    /**
    * @notice Sets the necessary permissions for a "blacklisted" user. A blacklisted user has their accounts
    * frozen; they cannot transfer, burn, or withdraw any tokens.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistedUser(address _who) public onlyValidator {
        require(availablePermissions.isPermission(BURN_SIG), "Burn method not supported by token");
        require(availablePermissions.isPermission(DESTROYSELF_SIG), "Self-destruct method not supported by token");
        userPermissions.removePermission(_who, BURN_SIG);
        userPermissions.setPermission(_who, DESTROYSELF_SIG);
    }

    /**
    * @notice Sets the necessary permissions for a "nonlisted" user. Nonlisted users can trade tokens,
    * but cannot burn them (and therefore cannot convert them into fiat.)
    * @param _who The address of the account that we are setting permissions for.
    */
    function setNonlistedUser(address _who) public onlyValidator {
        require(availablePermissions.isPermission(BURN_SIG), "Burn method not supported by token");
        require(availablePermissions.isPermission(DESTROYSELF_SIG), "Self-destruct method not supported by token");
        userPermissions.removePermission(_who, BURN_SIG);
        userPermissions.removePermission(_who, DESTROYSELF_SIG);
    }

    /** Returns whether or not a user is whitelisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is whitelisted, `false` otherwise.
     */
    function isWhitelistedUser(address _who) public view returns (bool) {
        return (hasPermission(_who, BURN_SIG) && !hasPermission(_who, DESTROYSELF_SIG));
    }

    /** Returns whether or not a user is blacklisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is blacklisted, `false` otherwise.
     */
    function isBlacklistedUser(address _who) public view returns (bool) {
        return (!hasPermission(_who, BURN_SIG) && hasPermission(_who, DESTROYSELF_SIG));
    }

    /** Returns whether or not a user is nonlisted.
     * @param _who The address of the account in question.
     * @return `true` if the user is nonlisted, `false` otherwise.
     */
    function isNonlistedUser(address _who) public view returns (bool) {
        return (!hasPermission(_who, BURN_SIG) && !hasPermission(_who, DESTROYSELF_SIG));
    }
        
    /**
    * @notice Sets a permission for an acccount. Only validators can set a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user is getting permission to run.
    */
    function setPermission(address _who, bytes4 _methodsignature) public onlyValidator {
        require(availablePermissions.isPermission(_methodsignature));
        userPermissions.setPermission(_who, _methodsignature);
    }
 
    /**
    * @notice Removes a permission for an acccount. Only validators can remove a permission
    * @param _who The address of the account that we are setting the value of an attribute for
    * @param _methodsignature The signature of the method that the user will no longer be able to execute.
    */
    function removePermission(address _who, bytes4 _methodsignature) public onlyValidator {
        require(availablePermissions.isPermission(_methodsignature));
        userPermissions.removePermission(_who, _methodsignature);
    }

    /**
    * @notice Checks whether an account has the permission to execute a function
    * @param _who The address of the account
    * @param _methodsignature The signature of the method in question
    * @return A boolean indicating whether the user has permission or not
    */
    function hasPermission(address _who, bytes4 _methodsignature) public view returns (bool) {
        return userPermissions.getPermission(_who, _methodsignature);
    }
}