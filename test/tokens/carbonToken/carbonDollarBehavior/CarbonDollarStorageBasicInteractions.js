const { FeeSheet, StablecoinWhitelist } = require('../../../helpers/artifacts');
const { expectRevert, ZERO_ADDRESS } = require('../../../helpers/common');


function carbonDollarStorageInteractionTests(owner, wtMinter) {
    describe('Fee sheet interactions', function () {
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
                    beforeEach(async function () {
                        await this.token.unlistToken(this.wtToken.address, {from: owner});
                    })
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
                    beforeEach(async function () {
                        await this.token.unlistToken(this.wtToken.address, {from: owner});
                    })
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