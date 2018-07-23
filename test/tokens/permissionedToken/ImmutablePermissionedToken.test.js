const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    ImmutablePermissionedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('ImmutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.owner = commonVars.accounts[0];
    this.minter = commonVars.accounts[1];
    this.validator = commonVars.accounts[2];
    this.blacklisted = commonVars.accounts[3];
    this.whitelisted = commonVars.accounts[4];
    this.nonlisted = commonVars.accounts[5];
    this.user = commonVars.accounts[6];
    
    beforeEach(async function () {
        this.token = await ImmutablePermissionedTokenMock.new(
            this.validator,
            this.minter,
            this.whitelisted,
            this.blacklisted,
            this.nonlisted,
            { from: this.owner })
    });
    permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user);
})
