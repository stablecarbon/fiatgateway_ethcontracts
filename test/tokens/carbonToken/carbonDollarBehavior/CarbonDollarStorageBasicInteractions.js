const { FeeSheet, StablecoinWhitelist } = require('../../../helpers/artifacts');
const { expectRevert, ZERO_ADDRESS } = require('../../../helpers/common');


function carbonDollarStorageInteractionTests(owner, wtMinter) {
    describe('Fee sheet interactions', function () {
            describe('setFeeSheet', function () {
                beforeEach(async function () {
                    this.oldFeeSheet = await this.token.stablecoinFees()
                    this.newFeeSheet = await FeeSheet.new({from:owner})
                })
                describe('when owner calls', function () {
                    const from = owner
                    it('sets FeeSheet storage location', async function () {
                        await this.token.setFeeSheet(this.newFeeSheet.address, {from});
                        assert.equal(await this.token.stablecoinFees(), this.newFeeSheet.address);
                    });
                    it('emits a FeeSheetChanged event', async function () {    
                        const {logs} = await this.token.setFeeSheet(this.newFeeSheet.address, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'FeeSheetChanged');
                        assert.equal(logs[0].args.oldSheet, this.oldFeeSheet);
                        assert.equal(logs[0].args.newSheet, this.newFeeSheet.address);
                    });
                    describe('sets FeeSheet to non-contract, 0x0, or existing sheet', function () {
                        it('reverts', async function () {
                            await expectRevert(this.token.setFeeSheet(ZERO_ADDRESS, {from}));
                            await expectRevert(this.token.setFeeSheet(owner, {from}));
                            await expectRevert(this.token.setFeeSheet(this.oldFeeSheet, {from}));

                        })
                    })
                })
                describe('when non owner calls', function () {
                    const from = wtMinter
                    it('reverts', async function () {
                        await expectRevert(this.token.setFeeSheet(this.newFeeSheet.address, { from }));
                    })
                })

            });
            describe('setFee, getFee', function () {
                describe('token is whitelisted', function () {
                    beforeEach(async function () {
                        await this.token.listToken(this.wtToken.address, {from: owner}); // Only whitelisted tokens may have a fee attached to them
                    })
                    it('sets fee for whitelisted token and gets updated fee', async function () {
                        await this.token.setFee(this.wtToken.address, 100, {from: owner});
                        assert.equal(await this.token.getFee(this.wtToken.address), 100);
                    });
                    it('reverts if called by non owner', async function () {
                        await expectRevert(this.token.setFee(this.wtToken.address, 100, {from:wtMinter}))
                    })
                    it('reverts when paused', async function () {
                        await this.token.pause({ from: owner })
                        await expectRevert(this.token.setFee(this.wtToken.address, 100, {from:owner}))
                    })
                })
                describe('token is not whitelisted', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setFee(this.wtToken.address, 100, {from:owner}))
                    })
                })
            });
            describe('removeFee', function () {
                describe('token is whitelisted', function () {
                    beforeEach(async function () {
                        await this.token.listToken(this.wtToken.address, {from:owner})
                        await this.token.setFee(this.wtToken.address, 100, {from:owner})
                    })
                    it('removes fee', async function () {
                        await this.token.removeFee(this.wtToken.address, {from:owner})
                        assert.equal(await this.token.getFee(this.wtToken.address), 0)
                    })
                    it('reverts if called by non owner', async function () {
                        await expectRevert(this.token.removeFee(this.wtToken.address, {from:wtMinter}))
                    })
                    it('reverts when paused', async function () {
                        await this.token.pause({ from: owner })
                        await expectRevert(this.token.removeFee(this.wtToken.address, {from:owner}))
                    })

                })
                describe('token is not whitelisted', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.removeFee(this.wtToken.address, {from:owner}))
                    }) 
                })
            })
            describe('setDefaultFee, getDefaultFee', function () {
                it('sets default fee', async function () {
                    await this.token.setDefaultFee(100, {from: owner});
                    assert.equal(await this.token.getDefaultFee(), 100);
                });
                it('reverts if paused', async function () {
                    await this.token.pause({ from: owner })
                    await expectRevert(this.token.setDefaultFee(100, {from: owner}));
                });
            });
    });
    describe('Stablecoin whitelist interactions', function () {
            describe('setStablecoinWhitelist', function () {
                beforeEach(async function () {
                    this.oldWhitelist = await this.token.stablecoinWhitelist()
                    this.newWhitelist = await StablecoinWhitelist.new({ from: owner });
                })
                describe('when owner calls', function () {
                    const from = owner
                    it('sets StablecoinWhitelist storage location', async function () {
                        await this.token.setStablecoinWhitelist(this.newWhitelist.address, { from });
                        assert.equal(await this.token.stablecoinWhitelist(), this.newWhitelist.address);
                    });
                    it('emits a StablecoinWhitelistChanged event', async function () {
                        const { logs } = await this.token.setStablecoinWhitelist(this.newWhitelist.address, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'StablecoinWhitelistChanged');
                        assert.equal(logs[0].args.oldWhitelist,  this.oldWhitelist);
                        assert.equal(logs[0].args.newWhitelist, this.newWhitelist.address);
                    });
                    describe('sets StablecoinWhitelist to non-contract, 0x0, or existing sheet', function () {
                        it('reverts', async function () {
                            await expectRevert(this.token.setStablecoinWhitelist(ZERO_ADDRESS, {from}));
                            await expectRevert(this.token.setStablecoinWhitelist(owner, {from}));
                            await expectRevert(this.token.setStablecoinWhitelist(this.oldWhitelist, {from}));

                        })
                    })   
                })
                describe('when non owner calls', function () {
                    const from = wtMinter
                    it('reverts', async function() {
                        await expectRevert(this.token.setStablecoinWhitelist(this.newWhitelist.address, { from }))
                    })
                })

            });
            describe('listToken', function () {
                it('adds stablecoin to whitelist', async function () {
                    await this.token.listToken(this.wtToken.address, {from:owner});
                    assert(await this.token.isWhitelisted(this.wtToken.address));
                });
                it('reverts when paused', async function () {
                    await this.token.pause({ from:owner })
                    await expectRevert(this.token.listToken(this.wtToken.address, {from:owner}))
                })
                describe('when sender is not owner', function () {
                    const from = wtMinter
                    it('reverts', async function () {
                        await expectRevert(this.token.listToken(this.wtToken.address, {from}))
                    });
                });
            });
            describe('unlistToken', function () {
                it('removes stablecoin from whitelist', async function () {
                    await this.token.unlistToken(this.wtToken.address, { from: owner });
                    assert(!(await this.token.isWhitelisted(this.wtToken.address)));
                });
                it('reverts when paused', async function () {
                    await this.token.pause({ from:owner })
                    await expectRevert(this.token.unlistToken(this.wtToken.address, {from:owner}))
                })
                describe('when sender is not owner', function () {
                    const from = wtMinter
                    it('reverts', async function () {
                        await expectRevert(this.token.unlistToken(this.wtToken.address, {from}))
                    });
                });
            });
    });
}

module.exports = {
    carbonDollarStorageInteractionTests
}