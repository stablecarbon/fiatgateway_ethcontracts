// Slightly modified from https://github.com/trusttoken/trueUSD

const { CommonVariables, expectThrow, expectRevert } = require('../helpers/common');

const { BalanceSheet } = require('../helpers/artifacts');

contract('BalanceSheet', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;

    beforeEach(async function () {
        this.sheet = await BalanceSheet.new({ from: owner })
        await this.sheet.addBalance(user, 100 * 10 ** 18, { from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        it('addBalance', async function () {
            await this.sheet.addBalance(user, 70 * 10 ** 18, { from })
            const balance = await this.sheet.balanceOf(user)
            assert.equal(balance, (100 + 70) * 10 ** 18)
        })

        it('subBalance', async function () {
            await this.sheet.subBalance(user, 70 * 10 ** 18, { from })
            const balance = await this.sheet.balanceOf(user)
            assert.equal(balance, (100 - 70) * 10 ** 18)
        })

        it('setBalance', async function () {
            await this.sheet.setBalance(user, 70 * 10 ** 18, { from })
            const balance = await this.sheet.balanceOf(user)
            assert.equal(balance, 70 * 10 ** 18)
        })

        it('reverts subBalance if insufficient funds', async function () {
            await expectThrow(this.sheet.subBalance(user, 170 * 10 ** 18, { from }))
        })
    })

    describe('when the sender is not the owner', function () {
        const from = user
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addBalance(user, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.subBalance(user, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.setBalance(user, 70 * 10 ** 18, { from }))
        })
    })
})