function carbonDollarTests(owner, wtMinter) {
    describe('Fee sheet interactions', function () {
        describe('when sender is owner', function () {
            describe('setFeeSheet', function () {
                it('sets fee sheet', async function () {
                    const feeSheet = FeeSheet.new({from: this.token});
                    await this.token.setFeeSheet(feeSheet.address, {from: owner});
                    assert.equal(await this.token.stablecoinFees(), feeSheet);
                });
                it('emits fee sheet changed event', async function () {    
                    const feeSheet = FeeSheet.new({ from: this.token });     
                    const {logs} = await this.token.setFeeSheet(this.token, { from: owner });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'FeeSheetChanged');
                    assert.equal(logs[0].args.oldSheet, ZERO_ADDRESS);
                    assert.equal(logs[0].args.newSheet, this.feeSheet.address);
                });
            });
            describe('setFee', function () {
                it('sets fee for a stablecoin', async function () {
                    await this.token.listToken(this.wtToken.address, {from: owner}); // Only whitelisted tokens may have a fee attached to them
                    await this.token.setFee(this.wtToken.address, 100, {from: owner});
                    assert.equal(await this.token.stablecoinFees().fees(this.wtToken.address), 100);
                });
            });
            describe('setDefaultFee', function () {
                it('sets default fee', async function () {
                    await this.token.setDefaultFee(100, {from: owner});
                    assert.equal(await this.token.stablecoinFees().defaultFee(), 100);
                });
            });
        });
        describe('when sender is not owner', function () {
            it('reverts all setter calls', async function () {
                const feeSheet = FeeSheet.new({ from: this.token });
                await expectRevert(this.token.setFeeSheet(feeSheet, { from: blacklisted }));
                await expectRevert(this.token.setFee(this.wtToken.address, 100, { from: blacklisted }));
                await expectRevert(this.token.setDefaultFee(100, { from: blacklisted }));
            });
        });
        describe('computeStablecoinFee', function () {
            it('computes fee for burning into stablecoin', async function () {
                await this.token.setFee(this.wtToken.address, 100);
                assert.equal(await this.token.stablecoinFees().fees(this.wtToken.address), 100);
            });
        });
    });
    describe('Stablecoin whitelist interactions', function () {
        describe('when sender is owner', function () {
            describe('setStablecoinWhitelist', function () {
                it('sets stablecoin whitelist sheet', async function () {
                    const stablecoinWhitelist = StablecoinWhitelist.new({ from: this.token });
                    await this.token.setStablecoinWhitelist(stablecoinWhitelist.address, { from: owner });
                    assert.equal(await this.token.stablecoinWhitelist(), stablecoinWhitelist);
                });
                it('emits stablecoin whitelist sheet changed event', async function () {
                    const stablecoinWhitelist = StablecoinWhitelist.new({ from: this.token });
                    const { logs } = await this.token.setStablecoinWhitelist(stablecoinWhitelist.address, { from: owner });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'StablecoinWhitelistChanged');
                    assert.equal(logs[0].args.oldSheet, ZERO_ADDRESS);
                    assert.equal(logs[0].args.newSheet, stablecoinWhitelist.address);
                });
            });
            describe('listToken', function () {
                it('adds stablecoin to whitelist', async function () {
                    await this.token.listToken(this.wtToken.address, { from: owner });
                    assert(await this.token.stablecoinWhitelist().isWhitelisted(this.wtToken.address));
                });
            });
            describe('unlistToken', function () {
                it('removes stablecoin from whitelist', async function () {
                    await this.token.unlistToken(this.wtToken.address, { from: owner });
                    assert(!(await this.token.stablecoinWhitelist().isWhitelisted(this.wtToken.address)));
                });
            });
        });
        describe('when sender is not owner', function () {
            it('reverts all calls', async function () {
                await this.token.unlistToken(this.wtToken.address, { from: owner });
                assert(!(await this.token.stablecoinWhitelist().isWhitelisted(this.wtToken.address)));
            });
        });
        describe('isWhitelisted', function () {
            it('correctly determines stablecoin is on whitelist', async function () {
                await this.token.listToken(this.wtToken.address, { from: owner });
                assert(await this.token.isWhitelisted(this.wtToken.address));
            });
            it('correctly determines stablecoin is not on whitelist', async function () {
                await this.token.unlistToken(this.wtToken.address, { from: owner });
                assert(!(await this.token.isWhitelisted(this.wtToken.address)));
            });
        });
    });
    describe("Mint and burn functions", function () {
        beforeEach(function() {
            this.feeSheet = FeeSheet.new({from: this.token});
            this.stablecoinWhitelist = StablecoinWhitelist.new({from: this.token});
            await this.token.setFeeSheet(feeSheet.address, { from: owner });
            await this.token.setStablecoinWhitelist(stablecoinWhitelist.address, { from: owner });
        })

        describe('mint', function () {
            describe('when sender is a token contract', function () {
                describe('when token contract is whitelisted', function () {
                    it('mints CUSD to user', async function () {
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.mint(whitelisted, 100 * 10 ** 18, { from: this.wtToken })
                        assertBalance(this.token, whitelisted, 100 * 10 ** 18);
                    });
                });
                describe('when token contract is not whitelisted', function () {
                    it('reverts call', async function () {
                        await this.token.unlistToken(this.wtToken.address, { from: owner });
                        await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, { from: this.wtToken }));
                    });
                });
            });

            describe('when sender is not a token contract', function () {
                it('reverts call', async function () {
                    await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, { from: whitelisted }));
                });
            });
        });
        describe('burnCarbonDollar', function () {
            describe('when desired stablecoin is whitelisted', function () {
                describe('when CUSD WT0 escrow account within stablecoin holds enough funds', function () {
                    it('converts user CUSD into WT0, minus a fee', async function () {
                        // Whitelist the WT0 contract and add a fee
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mint(whitelisted, 100 * 10 ** 18, true, { from: wtMinter });
                        this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });

                        assertBalance(this.wtToken, whitelisted, 45 * 10 ** 18); // User gets WT0 returned to them
                        assertBalance(this.token, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance

                    });
                    it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                        // Whitelist the WT0 contract and add a fee
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mint(whitelisted, 100 * 10 ** 18, true, { from: wtMinter });
                        await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });

                        assertBalance(this.token, this.token.address, 10 * 10 ** 18); // Fee deposited into Carbon account for transaction                    
                    });
                    it('diminishes amount in CUSD WT0 escrow account', async function () {
                        // Whitelist the WT0 contract and add a fee
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mint(whitelisted, 100 * 10 ** 18, true, { from: wtMinter });
                        await this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });

                        assertBalance(this.wtToken, this.token.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
                    });
                });
                describe('when CUSD escrow account within stablecoin does not hold enough funds', function () {
                    it('reverts call', async function () {
                        await this.token.listToken(this.wtToken.address, { from: owner });
                        await this.token.setFee(this.wtToken.address, 100, { from: owner });  // 10% fee
                        // Mint CarbonUSD for user
                        await this.wtToken.mint(whitelisted, 100 * 10 ** 18, true, { from: wtMinter });
                        await this.wtToken.burn(90 * 10 ** 18, { from: this.token.address }); // Carbon's escrow account in WT0 now only has 10*10**18 tokens
                        await expectRevert(this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                    });
                });
            });
            describe('when desired stablecoin is not whitelisted', function () {
                it('reverts call', async function () {
                    await this.token.listToken(this.wtToken.address, { from: owner });
                    await this.token.setFee(this.wtToken.address, 100, { from: owner });
                    // Mint CarbonUSD for user
                    await this.token.mint(whitelisted, 100 * 10 ** 18, { from: this.wtToken });
                    // After this operation, user has CUSD, but Carbon doesn't have any escrowed WT0 to back it.
                    await expectRevert(this.token.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
                });
            });
        });
    });
}

module.exports = {
    carbonDollarTests
}