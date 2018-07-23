const { modularTokenTests } = require('../permissionedToken/ModularTokenTests');
const { permissionedTokenTests } = require('../permissionedToken/PermissionedTokenTests');
const { carbonDollarTests } = require('./CarbonDollarTests');
const {
    CarbonDollar,
    FeeSheet,
    StablecoinWhitelist,
    CommonVariables
} = require('../../helpers/common');

contract('CarbonDollar', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.accounts[0];
    this.validator = commonVars.accounts[1];
    this.blacklisted = commonVars.accounts[2];
    this.whitelisted = commonVars.accounts[3];
    this.nonlisted = commonVars.accounts[4];

    describe("CarbonDollar tests", function () {
        beforeEach(async function () {
            this.token = await CarbonDollarMock.new({ from: owner })
            this.wtToken = await WhitelistedTokenMock.new({ from: owner })
        });
        modularTokenTests();
        permissionedTokenTests();
        carbonDollarTests(minter);
    });
})
