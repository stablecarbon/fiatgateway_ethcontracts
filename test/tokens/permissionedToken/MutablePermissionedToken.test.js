const { modularTokenTests } = require('./ModularTokenTests');
const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    MutablePermissionedToken,
    MutablePermissionedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('MutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const minter = commonVars.accounts[0]; // Also the token owner (in order to make ModularTokenTest compatible)
    const validator = commonVars.accounts[1];
    const blacklisted = commonVars.accounts[2];
    const whitelisted = commonVars.accounts[3]; // Account will be loaded with one hundred tokens for modularTokenTests
    const nonlisted = commonVars.accounts[4]; // otherAccount
    const user = commonVars.accounts[5];

    beforeEach(async function () {
        this.token = await MutablePermissionedTokenMock.new(
            validator,
            minter,
            whitelisted,
            blacklisted,
            nonlisted,
            { from: minter })
    })

    describe("MutableToken acts like a modular token", function() {
        modularTokenTests(minter, whitelisted, nonlisted);
    });
    describe("MutableToken acts like a permissioned token", function () {
        permissionedTokenTests(minter, whitelisted, nonlisted, blacklisted, user);
    });
})