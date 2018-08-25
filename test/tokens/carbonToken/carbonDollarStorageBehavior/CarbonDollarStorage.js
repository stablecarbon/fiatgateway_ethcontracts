const { ZERO_ADDRESS, expectRevert, RANDOM_ADDRESS } = require('../../../helpers/common');
const { CarbonDollarStorage } = require('../../../helpers/artifacts');

function carbonDollarStorageTests(owner, tokenHolder, spender, user) {

    describe('CarbonDollarStorage behavior tests', function () {

        describe('FeeSheet CRUD tests', function () {
            describe('when the sender is the owner', function () {
                const from = owner
                describe('setDefaultFee', function() {
                    it('sets default fee', async function () {
                        await this.storage.setDefaultFee(1000, { from })
                        assert.equal(await this.storage.defaultFee(), 1000)
                    })
                    it('emits default fee changed event if fee was changed', async function () {
                        const { logs } = await this.storage.setDefaultFee(1000, { from })
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'DefaultFeeChanged');
                        assert.equal(logs[0].args.oldFee, 0);
                        assert.equal(logs[0].args.newFee, 1000);
                    })
                    it('does not emit default fee changed event if fee wasn\'t changed', async function () {
                        const { logs } = await this.storage.setDefaultFee(0, { from })
                        assert.equal(logs.length, 0);
                    })
                })

                describe('setFee', function () {
                    it('sets fee for a stablecoin', async function () {
                        await this.storage.setFee(RANDOM_ADDRESS, 1000, { from })
                        assert.equal(await this.storage.fees(RANDOM_ADDRESS), 1000)
                    })
                    it('emits fee changed event if fee was changed', async function () {
                        const { logs } = await this.storage.setFee(RANDOM_ADDRESS, 1000, { from })
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'FeeChanged');
                        assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
                        assert.equal(logs[0].args.oldFee, 0);
                        assert.equal(logs[0].args.newFee, 1000);
                    })
                    it('does not emit fee changed event if fee wasn\'t changed', async function () {
                        const { logs } = await this.storage.setFee(RANDOM_ADDRESS, 0, { from })
                        assert.equal(logs.length, 0);
                    })
                })

                describe('removeFee', function () {
                    it('removes fee for a stablecoin', async function () {
                        await this.storage.removeFee(RANDOM_ADDRESS, { from })
                        assert.equal(await this.storage.fees(RANDOM_ADDRESS), 0)
                    })
                    it('emits fee removed event if stablecoin\'s fee was indeed removed', async function () {
                        await this.storage.setFee(RANDOM_ADDRESS, 1000, { from })
                        const { logs } = await this.storage.removeFee(RANDOM_ADDRESS, { from })
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'FeeRemoved');
                        assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
                        assert.equal(logs[0].args.oldFee, 1000);
                    })
                    it('does not emit fee removed event if stablecoin fee was never set', async function () {
                        const { logs } = await this.storage.removeFee(RANDOM_ADDRESS, { from })
                        assert.equal(logs.length, 0);
                    })
                })

                describe('computeFee and computeStablecoinFee', function() {
                    it('computes the fee given an amount and a fee percentage', async function () {            
                        assert.equal(await this.storage.computeFee(1000, 100, { from }), 100) // 10.0% of 1000 is 100
                    })
                    it('computes the fee given an amount and a stablecoin', async function () {
                        await this.storage.setFee(RANDOM_ADDRESS, 100, { from })
                        assert.equal(await this.storage.computeStablecoinFee(1000, RANDOM_ADDRESS, { from }), 100) // 10.0% of 1000 is 100
                    })
                })  
            })

            describe('when the sender is not the owner', function () {
                const from = tokenHolder

                it('reverts all changeable calls', async function () {
                    await expectRevert(this.storage.setFee(RANDOM_ADDRESS, 1000, { from }))
                    await expectRevert(this.storage.setDefaultFee(1000, { from }))
                    await expectRevert(this.storage.removeFee(RANDOM_ADDRESS, { from }))
                })
                describe('still computes fee', async function () {
                    describe('computeFee', function () {
                        it('computes the fee given an amount and a fee percentage', async function () {
                            assert.equal(await this.storage.computeFee(1000, 100, { from }), 100) // 10.0% of 1000 is 100
                        })
                        it('computes the fee given an amount and a stablecoin', async function () {
                            await this.storage.setFee(RANDOM_ADDRESS, 100, { from:owner })
                            assert.equal(await this.storage.computeStablecoinFee(1000, RANDOM_ADDRESS, { from }), 100) // 10.0% of 1000 is 100
                        })
                    })
                })
            })
        })

        describe('StablecoinWhitelist CRUD tests', function () {

            describe('when the sender is the owner', function () {
                const from = owner
                describe('addStablecoin', function () {
                    it("adds the stablecoin to the whitelist", async function () {
                        await this.storage.addStablecoin(RANDOM_ADDRESS, { from });
                        assert(await this.storage.isWhitelisted(RANDOM_ADDRESS));
                    })
                    it("emits a StablecoinAdded event", async function () {
                        const { logs } = await this.storage.addStablecoin(RANDOM_ADDRESS, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'StablecoinAdded');
                        assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
                    })
                })

                describe('removeStablecoin', function () {
                    beforeEach(async function () {
                        await this.storage.addStablecoin(RANDOM_ADDRESS, { from })
                        assert(await this.storage.isWhitelisted(RANDOM_ADDRESS))
                    })
                    it("removes the stablecoin from the whitelist", async function () {
                        await this.storage.removeStablecoin(RANDOM_ADDRESS, { from });
                        assert(!(await this.storage.isWhitelisted(RANDOM_ADDRESS)));
                    })
                    it("emits a StablecoinRemoved event", async function () {
                        const { logs } = await this.storage.removeStablecoin(RANDOM_ADDRESS, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'StablecoinRemoved');
                        assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
                    })
                })
            })

            describe('when the sender is not the owner', function () {
                const from = tokenHolder
                it('reverts all calls', async function () {
                    await expectRevert(this.storage.addStablecoin(RANDOM_ADDRESS, { from }));
                    await expectRevert(this.storage.removeStablecoin(RANDOM_ADDRESS, { from }));
                })
            })
        })
    })
}

module.exports = {
    carbonDollarStorageTests
}