const { mutablePermissionedTokenStorage } = require('./MutablePermissionedTokenStorage');
const { MutablePermissionedToken, AllowanceSheet, BalanceSheet } = require('../../helpers/artifacts');

const { CommonVariables } = require('../../helpers/common');
contract('MutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const user = commonVars.validator2
    
    beforeEach(async function () {
        const from = owner

        // Set up token data storage
        this.allowances = await AllowanceSheet.new({ from });
        this.balances = await BalanceSheet.new({ from });
        this.token = await MutablePermissionedToken.new(this.allowances.address, this.balances.address, { from });
        await this.allowances.transferOwnership(this.token.address, { from });
        await this.balances.transferOwnership(this.token.address, { from });

    });
    describe("Permissioned Token tests", function () {
        mutablePermissionedTokenStorage(owner, user);
    });
})