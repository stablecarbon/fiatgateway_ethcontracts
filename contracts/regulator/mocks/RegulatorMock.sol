pragma solidity ^0.4.23;

import "../Regulator.sol";
import "./ValidatorStorageMock.sol";
import "../UserPermissionsStorage.sol";
import "./PermissionStorageMock.sol";

contract RegulatorMock is Regulator {
    /** 
        @dev Creates a validator, and one whitelisted, blacklisted, and nonlisted user.
        @param validator Address of account to make a validator.
        @param whitelisted Address of account to make a whitelisted user.
        @param blacklisted Address of account to make a blacklisted user.
        @param nonlisted Address of account to make a nonlisted user.
     */
    constructor(address validator, address minter, address whitelisted, address blacklisted, address nonlisted) Regulator() public {
        validators = new ValidatorStorageMock(validator);
        availablePermissions = new PermissionStorageMock();
        userPermissions = new UserPermissionsStorage();
        
        validators.addValidator(validator);
        setMinter(minter);
        setWhitelistedUser(whitelisted);
        setBlacklistedUser(blacklisted);
        setNonlistedUser(nonlisted);
    }
}