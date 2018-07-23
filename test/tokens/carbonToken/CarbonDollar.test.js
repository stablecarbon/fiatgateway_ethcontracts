const { modularTokenTests } = require('../permissionedToken/ModularTokenTests');
const { permissionedTokenTests } = require('../permissionedToken/PermissionedTokenTests');
const { carbonDollarTests } = require('./CarbonDollarTests');
const {
    CarbonDollarMock,
    FeeSheet,
    StablecoinWhitelist,
    CommonVariables
} = require('../../helpers/common');

contract('CarbonDollar', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.owner = commonVars.accounts[0];
    this.minter = commonVars.accounts[1];
    this.validator = commonVars.accounts[2];
    this.blacklisted = commonVars.accounts[3];
    this.whitelisted = commonVars.accounts[4];
    this.nonlisted = commonVars.accounts[5];

    describe("CarbonDollar tests", function () {
        beforeEach(async function () {
            this.token = await CarbonDollarMock.new(
                this.validator,
                this.minter,
                this.blacklisted,
                this.whitelisted,
                this.nonlisted,
                { from: this.owner })
            this.wtToken = await WhitelistedTokenMock.new(
                this.validator,
                this.minter,
                this.blacklisted,
                this.whitelisted,
                this.nonlisted,
                { from: this.owner })
        });
        modularTokenTests(this.minter, this.whitelisted, this.nonlisted);
        permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user);
        carbonDollarTests(this.owner);
    });
})
