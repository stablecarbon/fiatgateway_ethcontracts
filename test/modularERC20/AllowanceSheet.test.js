// Slightly modified from https://github.com/trusttoken/trueUSD

const { CommonVariables, expectThrow, expectRevert, assertBalance } = require('../helpers/common');

const { AllowanceSheet } = require('../helpers/artifacts');

contract('AllowanceSheet', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const tokenHolder = commonVars.user;
    const spender = commonVars.user2;

    beforeEach(async function () {
        this.sheet = await AllowanceSheet.new({ from: owner })
        await this.sheet.addAllowance(tokenHolder, spender, 100 * 10 ** 18, { from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        it('addAllowance', async function () {
            await this.sheet.addAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(tokenHolder, spender)
            assertBalance(balance, (100 + 70) * 10 ** 18)
        })

        it('subAllowance', async function () {
            await this.sheet.subAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(tokenHolder, spender)
            assertBalance(balance, (100 - 70) * 10 ** 18)
        })

        it('setAllowance', async function () {
            await this.sheet.setAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
            const balance = await this.sheet.allowanceOf(tokenHolder, spender)
            assertBalance(balance, 70 * 10 ** 18)
        })

        it('reverts subAllowance if insufficient funds', async function () {
            await expectThrow(this.sheet.subAllowance(tokenHolder, spender, 170 * 10 ** 18, { from }))
        })
    })

    describe('when the sender is not the owner', function () {
        const from = tokenHolder
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.subAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
            await expectRevert(this.sheet.setAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
        })
    })
})