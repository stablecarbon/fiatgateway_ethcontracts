const { modularTokenTests } = require('./ModularTokenTests');
const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    MutablePermissionedTokenMock,
    ImmutablePermissionedTokenMock,
    CommonVariables
} = require('../helpers/common');

contract('PermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.tokenOwner;
    this.validator = commonVars.tokenValidator;
    this.blacklisted = commonVars.attacker;
    this.whitelisted = commonVars.userSender;
    this.nonlisted = commonVars.userReceiver;
    
    describe("MutablePermissionedToken tests", function() {
        beforeEach(async function () {
            this.token = await MutablePermissionedTokenMock.new(
                this.validator,
                this.minter,
                this.whitelisted,
                this.blacklisted,
                this.nonlisted,
                { from: owner })
        });
        modularTokenTests();
        permissionedTokenTests();
    });

    describe("ImmutablePermissionedToken tests", function () {
        beforeEach(async function () {
            this.token = await ImmutablePermissionedTokenMock.new(
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
