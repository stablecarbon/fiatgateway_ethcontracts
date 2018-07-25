pragma solidity ^0.4.23;

import "../Regulator.sol";
import "../helpers/mocks/PermissionsStorageMock.sol";
import "../helpers/mocks/ValidatorStorageMock.sol";

contract RegulatorMock is Regulator {
    /** 
        @dev Creates a validator, and one whitelisted, blacklisted, and nonlisted user.
        @param validator Address of account to make a validator.
        @param whitelisted Address of account to make a whitelisted user.
        @param blacklisted Address of account to make a blacklisted user.
        @param nonlisted Address of account to make a nonlisted user.
     */
    constructor(address validator, address minter, address whitelisted, address blacklisted, address nonlisted) public {
        validators = new ValidatorStorageMock(validator);
        permissions = new PermissionsStorageMock();
        
        setMinter(minter);
        setWhitelistedUser(whitelisted);
        setBlacklistedUser(blacklisted);
        setNonlistedUser(nonlisted);
    }
}