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
    this.wtMinter = commonVars.accounts[2];
    this.validator = commonVars.accounts[3];
    this.wtValidator = commonVars.accounts[4];
    this.blacklisted = commonVars.accounts[5];
    this.whitelisted = commonVars.accounts[6];
    this.nonlisted = commonVars.accounts[7];

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
                this.wtValidator,
                this.wtMinter,
                this.blacklisted,
                this.whitelisted,
                this.nonlisted,
                { from: this.owner })
        });
        describe("Modular token tests", function (){modularTokenTests(this.minter, this.whitelisted, this.nonlisted)});
        describe("Permissioned token tests",
            function (){permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user)});
        describe("Carbon dollar tests", function (){carbonDollarTests(this.owner)});
    });
})
