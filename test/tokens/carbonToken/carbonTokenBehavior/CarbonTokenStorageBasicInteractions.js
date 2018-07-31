const { FeeSheet, StablecoinWhitelist } = require('../../../helpers/artifacts');
const { expectRevert, ZERO_ADDRESS } = require('../../../helpers/common');


function carbonDollarStorageInteractions(owner, wtMinter) {
    describe('Fee sheet interactions', function () {
        describe('when sender is owner', function () {
            describe('setFeeSheet', function () {
                beforeEach(async function () {
                    this.oldFeeSheet = await this.token.stablecoinFees()
                    this.newFeeSheet = await FeeSheet.new({from:owner})
                })
                it('sets FeeSheet storage location', async function () {
                    await this.token.setFeeSheet(this.newFeeSheet.address, {from: owner});
                    assert.equal(await this.token.stablecoinFees(), this.newFeeSheet.address);
                });
                it('emits a FeeSheetChanged event', async function () {    
                    const {logs} = await this.token.setFeeSheet(this.newFeeSheet.address, { from: owner });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'FeeSheetChanged');
                    assert.equal(logs[0].args.oldSheet, this.oldFeeSheet);
                    assert.equal(logs[0].args.newSheet, this.newFeeSheet.address);
                });
                describe('sets FeeSheet to non-contract, 0x0, or existing sheet', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setFeeSheet(ZERO_ADDRESS, {from: owner}));
                        await expectRevert(this.token.setFeeSheet(owner, {from: owner}));
                        await expectRevert(this.token.setFeeSheet(this.oldFeeSheet, {from: owner}));

                    })
                })
            });
            // describe('setFee and getFee', function () {
            //     it('sets fee for whitelisted token and gets updated fee', async function () {
            //         await this.token.listToken(this.wtToken.address, {from: owner}); // Only whitelisted tokens may have a fee attached to them
            //         await this.token.setFee(this.wtToken.address, 100, {from: owner});
            //         assert.equal(await this.token.getFee(this.wtToken.address), 100);
            //     });
            // });
            // describe('setDefaultFee', function () {
            //     it('sets default fee', async function () {
            //         await this.token.setDefaultFee(100, {from: owner});
            //         assert.equal(await this.token.getDefaultFee(), 100);
            //     });
            // });
        });
        // describe('when sender is not owner', function () {
        //     it('reverts all setter calls', async function () {
        //         const feeSheet = FeeSheet.new({ from: this.token });
        //         await expectRevert(this.token.setFeeSheet(feeSheet, { from: blacklisted }));
        //         await expectRevert(this.token.setFee(this.wtToken.address, 100, { from: blacklisted }));
        //         await expectRevert(this.token.setDefaultFee(100, { from: blacklisted }));
        //     });
        // });
        // describe('computeStablecoinFee', function () {
        //     it('computes fee for burning into stablecoin', async function () {
        //         await this.token.setFee(this.wtToken.address, 100);
        //         assert.equal(await this.token.stablecoinFees().fees(this.wtToken.address), 100);
        //     });
        // });
    });
    describe('Stablecoin whitelist interactions', function () {
        describe('when sender is owner', function () {
            describe('setStablecoinWhitelist', function () {
                beforeEach(async function () {
                    this.oldWhitelist = await this.token.stablecoinWhitelist()
                    this.newWhitelist = await StablecoinWhitelist.new({ from: owner });
                })
                it('sets StablecoinWhitelist storage location', async function () {
                    await this.token.setStablecoinWhitelist(this.newWhitelist.address, { from: owner });
                    assert.equal(await this.token.stablecoinWhitelist(), this.newWhitelist.address);
                });
                it('emits a StablecoinWhitelistChanged event', async function () {
                    const { logs } = await this.token.setStablecoinWhitelist(this.newWhitelist.address, { from: owner });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'StablecoinWhitelistChanged');
                    assert.equal(logs[0].args.oldWhitelist,  this.oldWhitelist);
                    assert.equal(logs[0].args.newWhitelist, this.newWhitelist.address);
                });
                describe('sets StablecoinWhitelist to non-contract, 0x0, or existing sheet', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setStablecoinWhitelist(ZERO_ADDRESS, {from: owner}));
                        await expectRevert(this.token.setStablecoinWhitelist(owner, {from: owner}));
                        await expectRevert(this.token.setStablecoinWhitelist(this.oldWhitelist, {from: owner}));

                    })
                })
            });
            describe('listToken', function () {
                it('adds stablecoin to whitelist', async function () {
                    await this.token.listToken(this.wtToken.address, { from: owner });
                    assert(await this.token.isWhitelisted(this.wtToken.address));
                });
            });
            // describe('unlistToken', function () {
            //     it('removes stablecoin from whitelist', async function () {
            //         await this.token.unlistToken(this.wtToken.address, { from: owner });
            //         assert(!(await this.token.stablecoinWhitelist().isWhitelisted(this.wtToken.address)));
            //     });
            // });
        });
        // describe('when sender is not owner', function () {
        //     it('reverts all calls', async function () {
        //         await this.token.unlistToken(this.wtToken.address, { from: owner });
        //         assert(!(await this.token.stablecoinWhitelist().isWhitelisted(this.wtToken.address)));
        //     });
        // });
        // describe('isWhitelisted', function () {
        //     it('correctly determines stablecoin is on whitelist', async function () {
        //         await this.token.listToken(this.wtToken.address, { from: owner });
        //         assert(await this.token.isWhitelisted(this.wtToken.address));
        //     });
        //     it('correctly determines stablecoin is not on whitelist', async function () {
        //         await this.token.unlistToken(this.wtToken.address, { from: owner });
        //         assert(!(await this.token.isWhitelisted(this.wtToken.address)));
        //     });
        // });
    });

}

module.exports = {
    carbonDollarStorageInteractions
}