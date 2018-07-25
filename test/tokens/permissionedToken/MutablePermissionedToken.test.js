const { modularTokenTests } = require('./ModularTokenTests');
const { permissionedTokenTests } = require('./PermissionedTokenTests');
const {
    MutablePermissionedToken,
    MutablePermissionedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('MutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.accounts[0]; // Also the token owner (in order to make ModularTokenTest compatible)
    this.validator = commonVars.accounts[1];
    this.blacklisted = commonVars.accounts[2];
    this.whitelisted = commonVars.accounts[3]; // Account will be loaded with one hundred tokens for modularTokenTests
    this.nonlisted = commonVars.accounts[4]; // otherAccount
    
    beforeEach(async function () {
        const allowanceSheet = AllowanceSheet.new({ from: this.minter });
        const balanceSheet = BalanceSheet.new({ from: this.minter });
        this.token = await MutablePermissionedTokenMock.new(
            this.allowanceSheet.address,
            this.balanceSheet.address,
            this.validator,
            this.minter,
            this.blacklisted,
            this.whitelisted,
            this.nonlisted,
            { from: this.minter })
        await allowanceSheet.transferOwnership(this.token.address, { from: this.minter });
        await balance.transferOwnership(this.token.address, { from: this.minter });
        await this.token.setAllowanceSheet(allowanceSheet.address, { from: this.minter });
        await this.token.setBalanceSheet(balanceSheet.address, { from: this.minter });
    });
    describe("Modular token tests", function() {modularTokenTests(this.minter, this.whitelisted, this.nonlisted)});
    describe("Permissioned token tests", 
        function() {permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user)});
    
})