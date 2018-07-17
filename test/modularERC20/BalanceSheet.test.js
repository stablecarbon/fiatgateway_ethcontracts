// Slightly modified from https://github.com/trusttoken/trueUSD

/* Loading all libraries from common */
const {
    CommonVariables,
    expectThrow,
    assertBalance,
    expectRevert,
    BalanceSheet,
} = require('../helpers/common');

contract('BalanceSheet', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const anotherAccount = commonVars.userSender;

    beforeEach(async function () {
        this.sheet = await BalanceSheet.new({ from: owner })
        await this.sheet.addBalance(anotherAccount, 100 * 10 ** 18, { from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        it('addBalance', async function () {
            await this.sheet.addBalance(anotherAccount, 70 * 10 ** 18, { from })
            await assertBalance(this.sheet, anotherAccount, (100 + 70) * 10 ** 18)
        })

        it('subBalance', async function () {
            await this.sheet.subBalance(anotherAccount, 70 * 10 ** 18, { from })
            await assertBalance(this.sheet, anotherAccount, (100 - 70) * 10 ** 18)
        })

        it('setBalance', async function () {
            await this.sheet.setBalance(anotherAccount, 70 * 10 ** 18, { from })
            await assertBalance(this.sheet, anotherAccount, 70 * 10 ** 18)
        })

        it('reverts subBalance if insufficient funds', async function () {
            await expectThrow(this.sheet.subBalance(anotherAccount, 170 * 10 ** 18, { from }))
        })
    })

    describe('when the sender is not the owner', function () {
        const from = anotherAccount
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addBalance(anotherAccount, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.subBalance(anotherAccount, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.setBalance(anotherAccount, 70 * 10 ** 18, { from }))
        })
    })
})