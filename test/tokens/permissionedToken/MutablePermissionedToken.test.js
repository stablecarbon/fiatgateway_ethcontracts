const { modularTokenTests } = require('./ModularTokenTests');
const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    MutablePermissionedTokenMock,
    CommonVariables
} = require('../helpers/common');

contract('PermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.tokenOwner;
    this.validator = commonVars.tokenValidator;
    this.blacklisted = commonVars.attacker;
    this.whitelisted = commonVars.userSender;
    this.nonlisted = commonVars.userReceiver;
    
    beforeEach(async function () {
        this.token = await MutablePermissionedTokenMock.new(
            this.validator,
            this.minter,
            this.whitelisted,
            this.blacklisted,
            this.nonlisted,
            { from: this.minter })
    });
    modularTokenTests(this.minter, this.whitelisted, this.nonlisted);
    permissionedTokenTests();
})
