const { modularTokenTests } = require('../permissionedToken/ModularTokenTests');
const { permissionedTokenTests } = require('../permissionedToken/PermissionedTokenTests');
const { carbonDollarTests } = require('./CarbonDollarTests');
const {
    CarbonDollar,
    FeeSheet,
    StablecoinWhitelist,
    CommonVariables
} = require('../helpers/common');

contract('CarbonDollar', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.tokenOwner;
    this.validator = commonVars.tokenValidator;
    this.blacklisted = commonVars.attacker;
    this.whitelisted = commonVars.userSender;
    this.nonlisted = commonVars.userReceiver;

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
