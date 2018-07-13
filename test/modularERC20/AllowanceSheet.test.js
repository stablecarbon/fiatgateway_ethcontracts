// Slightly modified from https://github.com/trusttoken/trueUSD

/* Loading all libraries from common */
const {
    CommonVariables,
    expectThrow,
    expectRevert,
    AllowanceSheet,
} = require('../helpers/common');

contract('AllowanceSheet', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const account2 = commonVars.userSender;
    const account3 = commonVars.userReceiver;

    beforeEach(async function () {
        this.sheet = await AllowanceSheet.new({ from: owner })
        await this.sheet.addAllowance(account2, account3, 100 * 10 ** 18, { from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        it('addAllowance', async function () {
            await this.sheet.addAllowance(account2, account3, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(account2, account3)
            assert.equal(balance, (100 + 70) * 10 ** 18)
        })

        it('subAllowance', async function () {
            await this.sheet.subAllowance(account2, account3, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(account2, account3)
            assert.equal(balance, (100 - 70) * 10 ** 18)
        })

        it('setAllowance', async function () {
            await this.sheet.setAllowance(account2, account3, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(account2, account3)
            assert.equal(balance, 70 * 10 ** 18)
        })

        it('reverts subAllowance if insufficient funds', async function () {
            await expectThrow(this.sheet.subAllowance(account2, account3, 170 * 10 ** 18, { from }))
        })
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addAllowance(account2, account3, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.subAllowance(account2, account3, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.setAllowance(account2, account3, 70 * 10 ** 18, { from }))
        })
    })
})