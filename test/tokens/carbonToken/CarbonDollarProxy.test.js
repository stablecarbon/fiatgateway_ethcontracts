const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common')

const { tokenSetupCDProxy } = require('../../helpers/tokenSetupCDProxy')

const { tokenSetup } = require('../../helpers/tokenSetup')

const { CarbonDollarProxy, CarbonDollar, CarbonDollarRegulator} = require('../../helpers/artifacts');

const { CarbonDollarMock } = require('../../helpers/mocks');

contract('CarbonDollarProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;
    const minter = commonVars.user3;
    const blacklisted = commonVars.attacker
    const whitelisted = commonVars.user4
    const nonlisted = commonVars.user5

    beforeEach(async function () {
        // Empty Proxy Data storage + fully loaded regulator
        this.proxyRegulator = (await CarbonDollarMock.new({from:validator})).address

        // First logic contract
        this.impl_v0 = (await CarbonDollar.new(this.proxyRegulator, { from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await CarbonDollarProxy.new(this.impl_v0, this.proxyRegulator, { from:proxyOwner })
        this.proxyAddress = this.proxy.address
    })

    describe('implementation', function () {
        const from = proxyOwner
        it('returns the implementation address', async function () {
            this.implementation = await this.proxy.implementation({from})
            assert.equal(this.implementation, this.impl_v0)
        })
    })

    describe('Proxy delegates calls to logic contract', function () {
        beforeEach(async function () {
            this.tokenProxyRegulator = CarbonDollarRegulator.at(this.proxyRegulator)
            this.tokenProxy = CarbonDollar.at(this.proxyAddress)

            this.logic_v0 = CarbonDollar.at(this.impl_v0)
        })
        describe('call to proxy to set fee', function () {
            beforeEach( async function() {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
            })
            it('proxy sets fee on stablecoin', async function () {
                await this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:proxyOwner})
                assert.equal(await this.tokenProxy.getFee(RANDOM_ADDRESS), 100)
            })
            it('proxy reverts when non-owner tries to set fee', async function () {
                await expectRevert(this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:user}));
            })
            it('proxy reverts when paused and tries to set fee', async function () {
                await this.tokenProxy.pause({from:proxyOwner});
                await expectRevert(this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:proxyOwner}));
            })
        })
        describe('call to proxy to set default fee', function () {
            it('proxy sets fee on stablecoin', async function () {
                await this.tokenProxy.setDefaultFee(100, {from:proxyOwner})
                assert.equal(await this.tokenProxy.getDefaultFee(), 100)
            })
            it('proxy reverts when non-owner tries to set default fee', async function () {
                await expectRevert(this.tokenProxy.setDefaultFee(100, {from:user}));
            })
            it('proxy reverts when paused and tries to set default fee', async function () {
                await this.tokenProxy.pause({from:proxyOwner});
                await expectRevert(this.tokenProxy.setDefaultFee(100, {from:proxyOwner}));
            })
        })
        describe('call to proxy to remove fee', function () {
            beforeEach(async function() {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
                await this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:proxyOwner})
            })
            it('proxy removes fee on stablecoin', async function () {
                await this.tokenProxy.removeFee(RANDOM_ADDRESS, {from:proxyOwner})
                assert.equal(await this.tokenProxy.getFee(RANDOM_ADDRESS), 0)
            })
            it('proxy reverts when non-owner tries to remove fee', async function () {
                await expectRevert(this.tokenProxy.removeFee(RANDOM_ADDRESS, {from:user}));
            })
            it('proxy reverts when paused and tries to remove fee', async function () {
                await this.tokenProxy.pause({from:proxyOwner});
                await expectRevert(this.tokenProxy.removeFee(RANDOM_ADDRESS, {from:proxyOwner}));
            })
        })
        describe('call to proxy to mint', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
                await this.tokenProxy.listToken(minter, { from: proxyOwner });
            })
            it('proxy mints to account', async function () {
                await this.tokenProxy.mint(whitelisted, 100 * 10 ** 18, { from: minter })
                assertBalance(this.tokenProxy, whitelisted, 100 * 10 ** 18);
            })
            it('proxy reverts when non-whitelisted address tries to mint', async function () {
                await this.tokenProxy.unlistToken(minter, {from:proxyOwner})
                await expectRevert(this.tokenProxy.mint(whitelisted, 100 * 10 ** 18, {from:minter}));
            })
            it('proxy reverts when paused and tries to set fee', async function () {
                await this.tokenProxy.pause({from:proxyOwner});
                await expectRevert(this.tokenProxy.mint(RANDOM_ADDRESS, 100, {from:minter}));
            })
        })

        describe("computeFeeRate", function() {
            beforeEach(async function () {
                await this.tokenProxy.listToken(minter, { from: proxyOwner });
                await this.tokenProxy.setFee(minter, 100, { from: proxyOwner });  // 10% fee
            })
            it("When stablecoin fee is specified, fee is listed correctly", async function () {
                assert.equal(await this.tokenProxy.computeFeeRate(minter), 100);
            })
            it("When no stablecoin fee is specified, the default fee is used", async function () {
                await this.tokenProxy.removeFee(minter, { from: proxyOwner });
                await this.tokenProxy.setDefaultFee(50, {from: proxyOwner});
                assert.equal(await this.tokenProxy.computeFeeRate(minter), 50);
            })
        })
        describe('call to proxy to list coin', function () {
            it('proxy whitelists stablecoin', async function () {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
                assert(await this.tokenProxy.isWhitelisted(RANDOM_ADDRESS))
                await this.tokenProxy.unlistToken(RANDOM_ADDRESS, {from:proxyOwner})
                assert(!(await this.tokenProxy.isWhitelisted(RANDOM_ADDRESS)))
            });
            it('reverts when non-owner tries to list coin', async function () {
                await expectRevert(this.tokenProxy.listToken(RANDOM_ADDRESS, {from:user}));
            });
            // following test fails
            it('reverts when paused and tries to list coin', async function () {
                await this.tokenProxy.pause({from:proxyOwner});
                await expectRevert(this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner}));
            })
        })
        describe('call proxy to burnCarbonDollar, relies on PermissionedToken calls working correctly', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            })
            beforeEach(async function () {
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.listToken(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: user });
            })
            it('Burns user CUSD, minus a fee', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.tokenProxy, whitelisted, 50 * 10**18); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.tokenProxy, this.tokenProxy.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction
            });
            it('burns amount in CUSD WT0 escrow account', async function () {
                await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            });
            it('emits a BurnedCUSD event', async function () {
                const { logs } = await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                this.logs = logs
                this.event = this.logs.find(l => l.event === 'BurnedCUSD').event
                this.args = this.logs.find(l => l.event === 'BurnedCUSD').args
                assert.equal(this.event, 'BurnedCUSD')
                assert.equal(this.args.user, whitelisted)
                assert.equal(this.args.feedAmount, 45 * 10 ** 18)
                assert.equal(this.args.chargedFee, 5 * 10 ** 18)
            })
            it('reverts when paused', async function () {
                await this.tokenProxy.pause({ from: proxyOwner })
                await expectRevert(this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
            })
            it('reverts when a user without permission to burn calls burnCarbonDollar', async function () {
                await expectRevert(this.tokenProxy.burnCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: nonlisted }));
            })
            it('reverts when CUSD escrow account with stablecoin does not hold enough funds', async function () {
                await expectRevert(this.tokenProxy.burnCarbonDollar(this.wtToken.address, 110 * 10 ** 18, { from: whitelisted }));
            })
        })
        describe('call proxy to convertCarbonDollar, relies on PermissionedToken calls working correctly', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            })
            beforeEach(async function () {
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.listToken(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: user });

                // Whitelisted account should have no WT tokens
                assert.equal(await this.wtToken.balanceOf(whitelisted), 0)
                // CUSD account should have WT tokens
                assert.equal(await this.wtToken.balanceOf(this.tokenProxy.address), 100 * 10 ** 18)
                // Whitelisted account should have carbon dollars
                assert.equal(await this.tokenProxy.balanceOf(whitelisted), 100 * 10 ** 18)
            })
            it('converts user CUSD into WT0, minus a fee', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.wtToken, whitelisted, 45 * 10 ** 18); // User gets WT0 returned to them
                assertBalance(this.tokenProxy, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.tokenProxy, this.tokenProxy.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction
            });
            it('diminishes amount in CUSD WT0 escrow account', async function () {
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            });
            // test below fails
            it('emits a ConvertedToWT event', async function () {
                const { logs } = await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                this.logs = logs
                this.event = this.logs.find(l => l.event === 'ConvertedToWT').event
                this.args = this.logs.find(l => l.event === 'ConvertedToWT').args
                assert.equal(this.event, 'ConvertedToWT')
                assert.equal(this.args.user, whitelisted)
                assert.equal(this.args.amount, 50 * 10 ** 18)
            })
            it("When no stablecoin fee is specified, the default fee is used", async function () {
                await this.tokenProxy.removeFee(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setDefaultFee(50, { from: proxyOwner });  // 5% fee
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted });
                assertBalance(this.wtToken, whitelisted, 475 * 10 ** 17); // User gets WT0 returned to them
                assertBalance(this.tokenProxy, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance
                assertBalance(this.tokenProxy, this.tokenProxy.address, 25 * 10 ** 17); // Fee deposited into Carbon account for transaction
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            })
            it('reverts when paused', async function () {
                await this.tokenProxy.pause({ from: proxyOwner })
                await expectRevert(this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: whitelisted }));
            })
            it('reverts when a user without permission to burn calls convertCarbonDollar', async function () {
                await expectRevert(this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: nonlisted }));
            })
            it('reverts when CUSD escrow account with stablecoin does not hold enough funds', async function () {
                await expectRevert(this.tokenProxy.convertCarbonDollar(this.wtToken.address, 110 * 10 ** 18, { from: whitelisted }));
            })
        })
    })

    describe('upgradeTo v1', function () {
        beforeEach(async function () {
            // Second logic contract
            await tokenSetup.call(this, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            this.impl_v1 = this.cdToken.address
        })
        describe('owner calls upgradeTo', function () {
            const from = proxyOwner
            beforeEach(async function () {
                const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
                this.tokenProxy = CarbonDollar.at(this.proxyAddress)

                this.logic_v0 = CarbonDollar.at(this.impl_v0)
                this.logic_v1 = CarbonDollar.at(this.impl_v1)

                this.logs = logs
                this.event = this.logs.find(l => l.event === 'Upgraded').event
                this.newImplementation = this.logs.find(l => l.event === 'Upgraded').args.implementation
            })
            it('upgrades to V1 implementation', async function () {
                this.implementation = await this.proxy.implementation( { from })
                assert.equal(this.implementation, this.impl_v1)
            })
            it('emits an Upgraded event', async function () {
                assert.equal(this.logs.length, 1)
                assert.equal(this.newImplementation, this.impl_v1)
            })
        })
        describe('CarbonDollar implementation owner calls upgradeTo', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
            })
        })
    })
    describe('Proxy handles stress tests:', function () {
        beforeEach(async function () {
            this.tokenProxyRegulator = CarbonDollarRegulator.at(this.proxyRegulator)
            this.tokenProxy = CarbonDollar.at(this.proxyAddress)

            this.logic_v0 = CarbonDollar.at(this.impl_v0)
        })
        /* note that the stress tests require considerably longer time compared to
           other tests due to the high volume of function calls */
        describe('Stress Test: handles calls to convertCarbonDollar', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            })
            beforeEach(async function () {
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.listToken(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: user });

            })
            it('converts user CUSD into WT0, minus a fee at high volume', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.wtToken, whitelisted, 45 * 10 ** 18); // User gets WT0 returned to them
                assertBalance(this.tokenProxy, whitelisted, 50 * 10 ** 18); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD at high volume', async function () {
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.tokenProxy, this.tokenProxy.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction
            });
            it('diminishes amount in CUSD WT0 escrow account at high volume', async function () {
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            });
        })
        describe('Stress Test: handles calls to burnCarbonDollar', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            })
            beforeEach(async function () {
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.listToken(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: user });

            })
            it('Burns user CUSD, minus a fee at high volume', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                for (i = 0; i < 100; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.tokenProxy, whitelisted, 0); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD at high volume', async function () {
                for (i = 0; i < 100; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.tokenProxy, this.tokenProxy.address, 10 * 10 ** 18); // Fee deposited into Carbon account for transaction
            });
            it('burns amount in CUSD WT0 escrow account at high volume', async function () {
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            });
        })
        describe('Stress Test: handles calls of burn and convert intermixed', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            })
            beforeEach(async function () {
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.listToken(this.wtToken.address, { from: proxyOwner });
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(whitelisted, 100 * 10 ** 18, { from: user });

            })
            it('correctly returns WT0 and diminishes CUSD at high volume', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.wtToken, whitelisted, 45 * 10 ** 18); // User gets WT0 returned to them
                assertBalance(this.tokenProxy, whitelisted, 0); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD at high volume', async function () {
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.tokenProxy, this.tokenProxy.address, 10 * 10 ** 18); // Fee dseposited into Carbon account for transaction
            });
            it('diminishes amount in CUSD WT0 escrow account at high volume', async function () {
                for (i = 0; i < 50; i++)
                {
                    await this.tokenProxy.burnCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                    await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 1 * 10 ** 18, { from: whitelisted });
                }
                assertBalance(this.wtToken, this.tokenProxy.address, 0); // Carbon's remaining WT0 escrowed balance
            });
        })
    })
})
