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
                    const balance = await this.storage.allowanceOf(tokenHolder, spender)
                    assert.equal(balance, (100 + 70) * 10 ** 18)
                })

                it('subAllowance', async function () {
                    await this.storage.subAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
                    const balance = await this.storage.allowanceOf(tokenHolder, spender)
                    assert.equal(balance, (100 - 70) * 10 ** 18)
                })

                it('setAllowance', async function () {
                    await this.storage.setAllowance(tokenHolder, spender, 70 * 10 ** 18, { from })
                    const balance = await this.storage.allowanceOf(tokenHolder, spender)
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
                    const balance = await this.storage.balanceOf(user)
                    assert.equal(balance, (100 + 70) * 10 ** 18)
                })
                it('subBalance', async function () {
                    await this.storage.subBalance(user, 70 * 10 ** 18, { from })
                    const balance = await this.storage.balanceOf(user)
                    assert.equal(balance, (100 - 70) * 10 ** 18)
                })
                it('setBalance', async function () {
                    await this.storage.setBalance(user, 70 * 10 ** 18, { from })
                    const balance = await this.storage.balanceOf(user)
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
        describe('Regulator reference tests', function () {
            it('regulator is set', async function () {
                assert.equal(await this.storage.regulator(), this.regulator.address)
            })
            describe('setRegulator', function () {

                beforeEach(async function () {
                    await this.regulatorFactory.createRegulatorProxy(this.regulator_impl_0.address, {from: owner })
                    this.regulator_impl_1 = Regulator.at(await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1))
                })
                describe('owner calls', function () {
                    const from = owner
                    it('sets new regulator', async function () {
                        await this.storage.setRegulator(this.regulator_impl_1.address, {from})
                    })
                    it('emits a ChangedRegulator event', async function () {
                        const { logs } = await this.storage.setRegulator(this.regulator_impl_1.address, {from})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, "ChangedRegulator")
                        assert.equal(logs[0].args.oldRegulator, this.regulator.address)
                        assert.equal(logs[0].args.newRegulator, this.regulator_impl_1.address)
                    })
                    it('new regulator cannot be the same', async function () {
                        await expectRevert(this.storage.setRegulator(this.regulator.address))
                    })
                    it('new regulator must be a contract', async function () {
                        await expectRevert(this.storage.setRegulator(tokenHolder))
                        await expectRevert(this.storage.setRegulator(ZERO_ADDRESS))
                    })
                })
                describe('non owner calls', function () {
                    const from = tokenHolder
                    it('reverts', async function () {
                        await expectRevert(this.storage.setRegulator(this.regulator_impl_1.address, {from}))
                    })
                })
            })
        })
    })
}

module.exports = {
    permissionedTokenStorageTests
}