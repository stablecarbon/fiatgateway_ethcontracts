const { modularTokenTests } = require('./ModularTokenTests');
const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    MutablePermissionedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('MutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.accounts[0]; // Also the token owner (in order to make ModularTokenTest compatible)
    this.validator = commonVars.accounts[1];
    this.blacklisted = commonVars.accounts[2];
    this.whitelisted = commonVars.accounts[3]; // Account will be loaded with one hundred tokens for modularTokenTests
    this.nonlisted = commonVars.accounts[4]; // otherAccount
    
    beforeEach(async function () {
        this.token = await MutablePermissionedTokenMock.new(
            this.validator,
            this.minter,
            this.blacklisted,
            this.whitelisted,
            this.nonlisted,
            { from: this.minter })
        console.log("HI");
    });
    describe("Modular token tests", function () {
        modularTokenTests(this.minter, this.whitelisted, this.nonlisted);
    })
    describe("Permissioned token tests", function () {
        permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user);
    })
    
})