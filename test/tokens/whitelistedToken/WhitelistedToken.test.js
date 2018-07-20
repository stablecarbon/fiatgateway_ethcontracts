const { permissionedTokenTests } = require('../permissionedToken/PermissionedTokenTests');
const {
    WhitelistedTokenMock,
    CommonVariables
} = require('../helpers/common');

contract('WhitelistedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.tokenOwner;
    this.validator = commonVars.tokenValidator;
    this.blacklisted = commonVars.attacker;
    this.whitelisted = commonVars.userSender;
    this.nonlisted = commonVars.userReceiver;

    describe("WhitelistedTokens tests", function () {
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
    });
})