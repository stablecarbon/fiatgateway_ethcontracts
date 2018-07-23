const { permissionedTokenTests } = require('../permissionedToken/PermissionedTokenTests');
const { whitelistedTokenTests } = require('./WhitelistedTokenTests');
const {
    WhitelistedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('WhitelistedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.accounts[0];
    this.validator = commonVars.accounts[1];
    this.blacklisted = commonVars.accounts[2];
    this.whitelisted = commonVars.accounts[3];
    this.nonlisted = commonVars.accounts[4];

    describe("WhitelistedToken tests", function () {
        beforeEach(async function () {
            this.token = await WhitelistedTokenMock.new(
                this.validator,
                this.minter,
                this.whitelisted,
                this.blacklisted,
                this.nonlisted,
                { from: owner })
        });
        permissionedTokenTests();
        whitelistedTokenTests();
    });
})