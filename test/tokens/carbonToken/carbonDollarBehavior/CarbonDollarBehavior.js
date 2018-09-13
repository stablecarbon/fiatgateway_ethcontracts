const { assertBalance, expectRevert } = require('../../../helpers/common');

function carbonDollarBehaviorTests(owner, wtMinter, whitelisted, validator) {

    describe("Mint and burn functions", function () {
        // Currently, we cannot test CarbonDollar.mint in isolation since this function 
        // can only be called by a whitelisted stablecoin address. However, we know that
        // mint() must work, since mintCUSD() in WhitelistedToken works.
        // describe('mint', function () {
        //     // describe('when sender is a token contract', function () {
        //         // describe('when token contract is whitelisted', function () {
        //         //     it('mints CUSD to user', async function () {
        //         //         await this.token.listToken(this.wtToken.address, { from: owner });
        //         //         await this.token.mint(whitelisted, 100 * 10 ** 18, { from: this.wtToken })
        //         //         assertBalance(this.token, whitelisted, 100 * 10 ** 18);
        //         //     });
        //         // });
        //         // describe('when token contract is not whitelisted', function () {
        //         //     it('reverts call', async function () {
        //         //         await this.token.unlistToken(this.wtToken.address, { from: owner });
        //         //         await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, { from: this.wtToken }));
        //         //     });
        //         // });
        //     // });

        //     describe('when sender is not a token contract', function () {
        //         it('reverts call', async function () {
        //             await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, { from: whitelisted }));
        //         });
        //     });
        // })       

        describe('burnCarbonDollar', function () {
            describe('when provided stablecoin address is whitelisted', function () {
                describe('when CUSD WT0 escrow account within stablecoin holds enough funds', function () {
                    beforeEach(async function () {
                        // Whitelist the WT0 contract and add a fee
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint WT for user directly into CUSD. We assume this function call works as intended
                        // (since WhitelistedToken will end up testing it.)
                        await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                    })
                    it('Burns user CUSD', async function () {
                        // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                        await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.token, whitelisted, 50 * 10**18); // User's remaining CUSD balance
                    });
                    it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                        await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.token, this.token.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction                    
                    });
                    it('burns amount in CUSD WT0 escrow account', async function () {
                        await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.wtToken, this.token.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
                    });
                    it('emits a BurnedCUSD event', async function () {
                        const { logs } = await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        this.logs = logs
                        this.event = this.logs.find(l => l.event === 'BurnedCUSD').event
                        this.args = this.logs.find(l => l.event === 'BurnedCUSD').args
                        assert.equal(this.event, 'BurnedCUSD')
                        assert.equal(this.args.user, whitelisted)
                        assert.equal(this.args.feedAmount, 45 * 10 ** 18)
                        assert.equal(this.args.chargedFee, 5 * 10 ** 18)
                    })
                    it('reverts when paused', async function () {
                        await this.token.pause({ from: owner })
                        await expectRevert(this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                    })
                })
                describe('when CUSD escrow account within stablecoin does not hold enough funds', function () {
                    it('reverts call', async function () {
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                        
                        // Workaround to burn WT0 escrowed tokens out of CUSD address
                        await this.regulator_w.setBlacklistDestroyer(validator, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.regulator_w.setBlacklistedUser(this.token.address, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.wtToken.destroyBlacklistedTokens(this.token.address, 90 * 10 ** 18, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.regulator_w.setWhitelistedUser(this.token.address, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        
                        await expectRevert(this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                    });
                });
            });
            describe('when desired stablecoin is not whitelisted', function () {
                it('reverts call', async function () {
                    await this.token.listToken(this.wtToken.address, { from: owner });
                    await this.token.setFee(this.wtToken.address, 100, { from: owner });
                    // Mint CarbonUSD for user
                    await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                    await this.token.unlistToken(this.wtToken.address, { from: owner });
                    await expectRevert(this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                });
            });
        });    

        describe('convertCarbonDollar', function () {
            describe('when desired stablecoin is whitelisted', function () {
                describe('when CUSD WT0 escrow account within stablecoin holds enough funds', function () {
                    beforeEach(async function () {
                        // Whitelist the WT0 contract and add a fee
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setDefaultFee(50, { from: owner });  // 5% fee
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint WT for user directly into CUSD
                        await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                        // Whitelisted account should have no WT tokens
                        assert.equal(await this.wtToken.balanceOf(whitelisted), 0)
                        // CUSD account should have WT tokens
                        assert.equal(await this.wtToken.balanceOf(this.token.address), 100 * 10 ** 18)
                        // Whitelisted account should have carbon dollars
                        assert.equal(await this.token.balanceOf(whitelisted), 100 * 10 ** 18)
                    })
                    it('converts user CUSD into WT0, minus a fee', async function () {
                        // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                        await this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.wtToken, whitelisted, 45 * 10 ** 18); // User gets WT0 returned to them
                        assertBalance(this.token, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance
                    });
                    it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                        await this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.token, this.token.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction                    
                    });
                    it('diminishes amount in CUSD WT0 escrow account', async function () {
                        await this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.wtToken, this.token.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
                    });
                    it('emits a ConvertedToWT event', async function () {
                        const { logs } = await this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        this.logs = logs
                        this.event = this.logs.find(l => l.event === 'ConvertedToWT').event
                        this.args = this.logs.find(l => l.event === 'ConvertedToWT').args
                        assert.equal(this.event, 'ConvertedToWT')
                        assert.equal(this.args.user, whitelisted)
                        assert.equal(this.args.amount, 50 * 10 ** 18)
                    })
                    it("When no stablecoin fee is specified, the default fee is used", async function () {
                        await this.token.removeFee(this.wtToken.address, { from: owner });
                        await this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                        assertBalance(this.wtToken, whitelisted, 475 * 10 ** 17); // User gets WT0 returned to them
                        assertBalance(this.token, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance
                        assertBalance(this.token, this.token.address, 25 * 10 ** 17); // Fee deposited into Carbon account for transaction 
                        assertBalance(this.wtToken, this.token.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
                    })
                    it('reverts when paused', async function () {
                        await this.token.pause({ from:owner })
                        await expectRevert(this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                    })
                });
                describe('when CUSD escrow account within stablecoin does not hold enough funds', function () {
                    it('reverts call', async function () {
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                        
                        // Workaround to burn WT0 escrowed tokens out of CUSD address
                        await this.regulator_w.setBlacklistDestroyer(validator, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.regulator_w.setBlacklistedUser(this.token.address, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.wtToken.destroyBlacklistedTokens(this.token.address, 90 * 10 ** 18, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await this.regulator_w.setWhitelistedUser(this.token.address, { from: validator }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        
                        await expectRevert(this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                    });
                });
            });
            describe('when desired stablecoin is not whitelisted', function () {
                it('reverts call', async function () {
                    await this.token.listToken(this.wtToken.address, { from: owner });
                    await this.token.setFee(this.wtToken.address, 100, { from: owner });
                    // Mint CarbonUSD for user
                    await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: wtMinter });
                    await this.token.unlistToken(this.wtToken.address, { from: owner });
                    await expectRevert(this.token.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                });
            });
        });
    });

    describe("Computational functions", function() {
        describe("computeFeeRate", function() {
            beforeEach(async function () {
                await this.token.listToken(this.wtToken.address, { from: owner });
                await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
            })
            it("When stablecoin fee is specified, fee is listed correctly", async function () {
                assert.equal(await this.token.computeFeeRate(this.wtToken.address), 100);
            })
            it("When no stablecoin fee is specified, the default fee is used", async function () {
                await this.token.removeFee(this.wtToken.address, { from: owner });
                await this.token.setDefaultFee(50, {from: owner});
                assert.equal(await this.token.computeFeeRate(this.wtToken.address), 50);
            })
        }) 
    });
}

module.exports = {
    carbonDollarBehaviorTests
}