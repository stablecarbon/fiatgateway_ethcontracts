pragma solidity ^0.4.24;

import "./dataStorage/RegulatorStorage.sol";

/**
 * @title Regulator
 * @dev Regulator can be configured to meet relevant securities regulations, KYC policies
 * AML requirements, tax laws, and more. The Regulator ensures that the PermissionedToken
 * makes compliant transfers possible. Contains the userPermissions necessary
 * for regulatory compliance.
 *
 */
contract Regulator is RegulatorStorage {
    
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
        require(isPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG), "Blacklist spending not supported by token");
        setUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
        emit LogSetBlacklistSpender(_who);
    }
    
    /**
    * @notice Removes the necessary permissions for a user to spend tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistSpender(address _who) public onlyValidator {
        require(isPermission(APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG), "Blacklist spending not supported by token");
        removeUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
        emit LogRemovedBlacklistSpender(_who);
    }

    /**
    * @notice Sets the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are setting permissions for.
    */
    function setBlacklistDestroyer(address _who) public onlyValidator {
        require(isPermission(DESTROY_BLACKLISTED_TOKENS_SIG), "Blacklist token destruction not supported by token");
        setUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
        emit LogSetBlacklistDestroyer(_who);
    }
    

    /**
    * @notice Removes the necessary permissions for a user to destroy tokens from a blacklisted account.
    * @param _who The address of the account that we are removing permissions for.
    */
    function removeBlacklistDestroyer(address _who) public onlyValidator {
        require(isPermission(DESTROY_BLACKLISTED_TOKENS_SIG), "Blacklist token destruction not supported by token");
        removeUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
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

    /** Returns whether or not a user is a blacklist spender.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist spender, `false` otherwise.
     */
    function isBlacklistSpender(address _who) public view returns (bool) {
        return hasUserPermission(_who, APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG);
    }

    /** Returns whether or not a user is a blacklist destroyer.
     * @param _who The address of the account in question.
     * @return `true` if the user is a blacklist destroyer, `false` otherwise.
     */
    function isBlacklistDestroyer(address _who) public view returns (bool) {
        return hasUserPermission(_who, DESTROY_BLACKLISTED_TOKENS_SIG);
    }

    /** Returns whether or not a user is a minter.
     * @param _who The address of the account in question.
     * @return `true` if the user is a minter, `false` otherwise.
     */
    function isMinter(address _who) public view returns (bool) {
        return hasUserPermission(_who, MINT_SIG);
    }

    /** Internal Functions **/

    function _setMinter(address _who) internal {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        setUserPermission(_who, MINT_SIG);
        emit LogSetMinter(_who);
    }

    function _removeMinter(address _who) internal {
        require(isPermission(MINT_SIG), "Minting not supported by token");
        removeUserPermission(_who, MINT_SIG);
        emit LogRemovedMinter(_who);
    }

    function _setNonlistedUser(address _who) internal {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        removeUserPermission(_who, BURN_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit LogNonlistedUser(_who);
    }

    function _setBlacklistedUser(address _who) internal {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        removeUserPermission(_who, BURN_SIG);
        setUserPermission(_who, BLACKLISTED_SIG);
        emit LogBlacklistedUser(_who);
    }

    function _setWhitelistedUser(address _who) internal {
        require(isPermission(BURN_SIG), "Burn method not supported by token");
        require(isPermission(BLACKLISTED_SIG), "Self-destruct method not supported by token");
        setUserPermission(_who, BURN_SIG);
        removeUserPermission(_who, BLACKLISTED_SIG);
        emit LogWhitelistedUser(_who);
    }
}