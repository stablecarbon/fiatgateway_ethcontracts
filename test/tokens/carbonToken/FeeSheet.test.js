/* Loading all libraries from common */
const {
    CommonVariables,
    expectRevert,
    FeeSheet,
} = require('../helpers/common');

contract('FeeSheet', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const account2 = commonVars.userSender;
    const stablecoinAddress = 0x3b5855bAEF50EBFdFC89c5E5463f92BCe194EAc9; // Just a random address

    beforeEach(async function () {
        this.sheet = await FeeSheet.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('setDefaultFee', function() {
            it('sets default fee', async function () {
                await this.sheet.setDefaultFee(1000, { from })
                assert.equal(await this.sheet.defaultFee(), 1000)
            })
            it('emits default fee changed event if fee was changed', async function () {
                const { logs } = await this.sheet.setDefaultFee(1000, { from })
                assert(logs.length, 1);
                assert(logs[0].event, 'DefaultFeeChanged');
                assert(logs[0].args.oldFee, 0);
                assert(logs[0].args.newFee, 1000);
            })
            it('does not emit default fee changed event if fee wasn\'t changed', async function () {
                const { logs } = await this.sheet.setDefaultFee(0, { from })
                assert(logs.length, 0);
            })
        })

        describe('setFee', function () {
            it('sets fee for a stablecoin', async function () {
                await this.sheet.setFee(stablecoinAddress, 1000, { from })
                assert.equal(await this.sheet.fee(stablecoinAddress), 1000)
                assert(await this.sheet.isFeeSet(stablecoinAddress))
            })
            it('emits fee changed event if fee was changed', async function () {
                const { logs } = await this.sheet.setFee(stablecoinAddress, 1000, { from })
                assert(logs.length, 1);
                assert(logs[0].event, 'FeeChanged');
                assert(logs[0].args.stablecoin, stablecoinAddress);
                assert(logs[0].args.oldFee, 0);
                assert(logs[0].args.newFee, 1000);
            })
            it('does not emit fee changed event if fee wasn\'t changed', async function () {
                const { logs } = await this.sheet.setFee(stablecoinAddress, 0, { from })
                assert(logs.length, 0);
            })
        })

        describe('removeFee', function () {
            it('removes fee for a stablecoin', async function () {
                await this.sheet.removeFee(stablecoinAddress, { from })
                assert.equal(await this.sheet.fee(stablecoinAddress), 0)
                assert(!(await this.sheet.isFeeSet(stablecoinAddress)))
            })
            it('emits fee removed event if stablecoin\'s fee was indeed removed', async function () {
                await this.sheet.setFee(stablecoinAddress, 1000, { from })
                const { logs } = await this.sheet.removeFee(stablecoinAddress, { from })
                assert(logs.length, 1);
                assert(logs[0].event, 'FeeRemoved');
                assert(logs[0].args.stablecoin, stablecoinAddress);
                assert(logs[0].args.oldFee, 1000);
            })
            it('does not emit fee removed event if stablecoin fee was never set', async function () {
                const { logs } = await this.sheet.removeFee(stablecoinAddress, { from })
                assert(logs.length, 0);
            })
        })

        describe('computeFee', function() {
            it('computes the fee given an amount and a fee percentage', async function () {            
                assert.equal(await this.sheet.computeFee(1000, 100, { from }), 100) // 10.0% of 1000 is 100
            })
            it('computes the fee given an amount and a stablecoin', async function () {
                await this.sheet.setFee(stablecoinAddress, 100, { from })
                assert.equal(await this.sheet.computeFee(1000, stablecoinAddress, { from }), 100) // 10.0% of 1000 is 100
            })
        })  
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all changeable calls', async function () {
            await expectRevert(this.sheet.setFee(stablecoinAddress, 1000, { from }))
            await expectRevert(this.sheet.setDefaultFee(1000, { from }))
            await expectRevert(this.sheet.removeFee(stablecoinAddress, { from }))
        })
        describe('still computes fee', async function () {
            describe('computeFee', function () {
                it('computes the fee given an amount and a fee percentage', async function () {
                    assert.equal(await this.sheet.computeFee(1000, 100, { from }), 100) // 10.0% of 1000 is 100
                })
                it('computes the fee given an amount and a stablecoin', async function () {
                    await this.sheet.setFee(stablecoinAddress, 100, { from })
                    assert.equal(await this.sheet.computeFee(1000, stablecoinAddress, { from }), 100) // 10.0% of 1000 is 100
                })
            })
        })
    })
})