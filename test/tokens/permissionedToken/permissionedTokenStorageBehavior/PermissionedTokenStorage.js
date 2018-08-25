const { ZERO_ADDRESS, expectRevert, expectThrow } = require('../../../helpers/common');
const { Regulator } = require('../../../helpers/artifacts');

function permissionedTokenStorageTests(owner, tokenHolder, spender, user) {

    describe('PermissionedTokenStorage behavior tests', function () {
        const from = owner
        beforeEach(async function () {
            await this.storage.addAllowance(tokenHolder, spender, 100 * 10 ** 18, { from })
            await this.storage.addBalance(user, 100 * 10 ** 18, { from: owner })
            await this.storage.addTotalSupply(100 * 10 ** 18, { from: owner })
        })

        describe('Allowances CRUD tests', function () {
            describe('owner calls', function () {
                const from = owner
                it('addAllowance', async function () {
                    await this.storage.addAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
                    const balance = await this.storage.allowances(tokenHolder, spender)
                    assert.equal(balance, (100 + 70) * 10 ** 18)
                })

                it('subAllowance', async function () {
                    await this.storage.subAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
                    const balance = await this.storage.allowances(tokenHolder, spender)
                    assert.equal(balance, (100 - 70) * 10 ** 18)
                })

                it('setAllowance', async function () {
                    await this.storage.setAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
                    const balance = await this.storage.allowances(tokenHolder, spender)
                    assert.equal(balance, 70 * 10 ** 18)
                })

                it('reverts subAllowance if insufficient funds', async function () {
                    await expectThrow(this.storage.subAllowance(tokenHolder, spender, 170 * 10 ** 18, { from }))
                })
            })

            describe('non-owner calls', function () {
                const from = tokenHolder
                it('reverts all calls', async function () {
                    await expectRevert(this.storage.addAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.subAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.setAllowance(tokenHolder, spender, 70 * 10 ** 18, { from }))
                })
            })
        })
        describe('Balances CRUD tests', function () {
            describe('owner calls', function () {
                const from = owner
                it('addBalance', async function () {
                    await this.storage.addBalance(user, 70 * 10 ** 18, { from })
                    const balance = await this.storage.balances(user)
                    assert.equal(balance, (100 + 70) * 10 ** 18)
                })
                it('subBalance', async function () {
                    await this.storage.subBalance(user, 70 * 10 ** 18, { from })
                    const balance = await this.storage.balances(user)
                    assert.equal(balance, (100 - 70) * 10 ** 18)
                })
                it('setBalance', async function () {
                    await this.storage.setBalance(user, 70 * 10 ** 18, { from })
                    const balance = await this.storage.balances(user)
                    assert.equal(balance, 70 * 10 ** 18)
                })
                it('reverts subBalance if insufficient funds', async function () {
                    await expectThrow(this.storage.subBalance(user, 170 * 10 ** 18, { from }))
                })
            })
            describe('non-owner calls', function () {
                const from = tokenHolder
                it('reverts all calls', async function () {
                    await expectRevert(this.storage.addBalance(user, 70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.subBalance(user, 70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.setBalance(user, 70 * 10 ** 18, { from }))
                })
            })
        })
        describe('totalSupply CRUD tests', function () {
            describe('owner calls', function () {
                const from = owner
                it('addTotalSupply', async function () {
                    await this.storage.addTotalSupply(70 * 10 ** 18, { from })
                    const supply = await this.storage.totalSupply()
                    assert(supply.eq((100 + 70) * 10 ** 18))
                })
                it('subTotalSupply', async function () {
                    await this.storage.subTotalSupply(70 * 10 ** 18, { from })
                    const supply = await this.storage.totalSupply()
                    assert(supply.eq((100 - 70) * 10 ** 18))
                })
                it('setTotalSupply', async function () {
                    await this.storage.setTotalSupply(70 * 10 ** 18, { from })
                    const supply = await this.storage.totalSupply()
                    assert(supply.eq(70 * 10 ** 18))
                })
                it('reverts subTotalSupply if going below zero', async function () {
                    await expectThrow(this.storage.subTotalSupply(170 * 10 ** 18, { from }))
                })
            })
            describe('non-owner calls', function () {
                const from = tokenHolder
                it('reverts all calls', async function () {
                    await expectRevert(this.storage.addTotalSupply(70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.subTotalSupply(70 * 10 ** 18, { from }))
                    await expectRevert(this.storage.setTotalSupply(70 * 10 ** 18, { from }))
                })
            })
        })
    })
}

module.exports = {
    permissionedTokenStorageTests
}