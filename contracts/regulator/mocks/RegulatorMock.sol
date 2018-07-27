pragma solidity ^0.4.23;

import "../Regulator.sol";


// Regulator implementation with an initial validator
contract RegulatorMock is Regulator {
    constructor(address minter) public {
        permissions = new PermissionsStorage();
        validators = new ValidatorStorage();

        setPS(permissions);
        setVS(validators);

        // add initial validator
        validators.addValidator(msg.sender);

        // set up user permissions
        // setMinter(minter);
    }
}