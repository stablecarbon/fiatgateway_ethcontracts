const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common')

const { tokenSetup } = require('../../helpers/tokenSetup')

const { WhitelistedTokenProxy, WhitelistedToken, CarbonDollar, WhitelistedTokenRegulator } = require('../../helpers/artifacts');

const { WhitelistedRegulatorMock } = require('../../helpers/mocks');

var BigNumber = require("bignumber.js");

contract('WhitelistedTokenProxy', _accounts => {
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
        // Empty Proxy Data storage + fully loaded regulator (all permissions + 1 validator)
        this.proxyRegulator = (await WhitelistedRegulatorMock.new({from:owner})).address

        this.proxyCUSD = (await CarbonDollar.new(ZERO_ADDRESS, {from:owner})).address
        // First logic contract
        this.impl_v0 = (await WhitelistedToken.new(this.proxyRegulator, this.proxyCUSD)).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await WhitelistedTokenProxy.new(this.impl_v0, this.proxyRegulator, this.proxyCUSD, { from:proxyOwner })
        this.proxyAddress = this.proxy.address
    })
    /*
    describe('set CUSD', function () {
        beforeEach(async function () {
            this.newProxyCUSD = (await CarbonDollar.new(RANDOM_ADDRESS, {from:owner})).address

            this.logic_v0 = await WhitelistedToken.at(this.impl_v0)
            this.token = WhitelistedToken.at(this.proxyAddress)
        })

        describe('owner calls', function () {
            const from = proxyOwner

            it('cusd is set initially', async function () {
                assert.equal(await this.proxy.cusdAddress(), this.proxyCUSD)
            })

            it('sets token proxy cusd', async function () {
                await this.token.setCUSDAddress(this.newProxyCUSD, {from})
                assert.equal(await this.proxy.cusdAddress(), this.newProxyCUSD)
            })
            it('emits a CUSDAddressChanged event', async function () {
                const { logs } = await this.token.setCUSDAddress(this.newProxyCUSD, {from})
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, 'CUSDAddressChanged')
                assert.equal(logs[0].args.oldCUSD, this.proxyCUSD)
                assert.equal(logs[0].args.newCUSD, this.newProxyCUSD)
            })
            it('does not change WT token implementation storages', async function () {
                await this.token.setCUSDAddress(this.newProxyCUSD, {from})
                assert.equal(await this.logic_v0.cusdAddress(), this.proxyCUSD)
            })
        })
        describe('non-owner calls', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.token.setCUSDAddress(this.newProxyCUSD, {from}))
            })
        })

    })

    describe('implementation', function () {
        const from = proxyOwner
        it('returns the implementation address', async function () {
            this.implementation = await this.proxy.implementation({from})
            assert.equal(this.implementation, this.impl_v0)
        })
    })

    describe('upgradeTo v1', function () {
        beforeEach(async function () {
            // Second logic contract
            await tokenSetup.call(this, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
            this.impl_v1 = this.wtToken.address
        })
        describe('owner calls upgradeTo', function () {
            const from = proxyOwner
            beforeEach(async function () {
                const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
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
        describe('WhitelistedToken implementation owner calls upgradeTo', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
            })
        })
    })
    */

    describe("Whitelisted token behavior tests", function () {
        beforeEach(async function () {
            this.tokenProxyRegulator = WhitelistedTokenRegulator.at(this.proxyRegulator)
            this.tokenProxy = WhitelistedToken.at(this.proxyAddress)

            this.logic_v0 = WhitelistedToken.at(this.impl_v0)

            // Transfer regulator storage ownership to regulator
            await this.permissionSheet.transferOwnership(this.tokenProxyRegulator.address, {from:owner})
            await this.validatorSheet.transferOwnership(this.tokenProxyRegulator.address, {from:owner})
            await this.tokenProxyRegulator.claimPermissionOwnership()
            await this.tokenProxyRegulator.claimValidatorOwnership()

            // Transfer token storage ownership to token
            await (BalanceSheet.at(await this.tokenProxy.balances())).transferOwnership(this.tokenProxy.address, {from:owner})
            await (AllowanceSheet.at(await this.tokenProxy.allowances())).transferOwnership(this.tokenProxy.address, {from:owner})
            await this.tokenProxy.claimBalanceOwnership()
            await this.tokenProxy.claimAllowanceOwnership()

            // set up cdToken
            await tokenSetupWLProxy.call(this, this.tokenProxy.address, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
        })
        const hundred = new BigNumber("100000000000000000000") // 100 * 10**18
        const fifty = new BigNumber("50000000000000000000") // 50 * 10**18
        describe('mintCUSD', function () {
            describe('user has mint CUSD permission', function () {
                beforeEach(async function () {
                    await this.cdToken.listToken(this.tokenProxy.address, { from: owner });
                });
                it('appropriate number of funds end up in Carbon\'s WT0 escrow account', async function () {
                    await this.tokenProxy.mintCUSD(whitelisted, hundred, { from: minter });
                    assertBalance(this.tokenProxy, await this.tokenProxy.cusdAddress(), hundred);
                });
                it('user has appropriate amount of CUSD', async function () {
                    await this.tokenProxy.mintCUSD(whitelisted, hundred, { from: minter });
                    assertBalance(this.cdToken, whitelisted, hundred);
                });
                it('reverts when paused', async function () {
                    await this.tokenProxy.pause({ from: proxyOwner })
                    await expectRevert(this.tokenProxy.mintCUSD(whitelisted, hundred, { from: minter }))
                })
            });
            describe('user does not have mint CUSD permission', function () {
                it('call reverts', async function () {
                    await expectRevert(this.tokenProxy.mintCUSD(whitelisted, hundred, { from: whitelisted }));
                });
            });
            describe('minting to CarbonUSD contract address', function () {
                it('should fail', async function () {
                    await expectRevert(this.tokenProxy.mintCUSD(this.cdToken.address, hundred, { from: minter }));
                });
            });
        });
        describe('convert', function () {
            describe('user has conversion permission', function () {
                describe('user has sufficient funds', function () {
                    beforeEach(async function () {
                        await this.cdToken.listToken(this.tokenProxy.address, { from: owner });
                        await this.tokenProxy.mint(whitelisted, hundred, { from: minter });
                    });
                    it('user loses WT0', async function () {
                        await this.tokenProxy.convertWT(fifty, { from: whitelisted });
                        assertBalance(this.tokenProxy, whitelisted, fifty);
                    });
                    it('user gains CUSD', async function () {
                        await this.tokenProxy.convertWT(fifty, { from: whitelisted });
                        assertBalance(this.cdToken, whitelisted, fifty);
                    });
                    it('Carbon gains WT0 in escrow', async function () {
                        await this.tokenProxy.convertWT(fifty, { from: whitelisted });
                        assertBalance(this.tokenProxy, await this.tokenProxy.cusdAddress(), fifty);
                    });
                    it('Burned to CUSD event is emitted', async function () {
                        const { logs } = await this.tokenProxy.convertWT(fifty, { from: whitelisted });
                        assert.equal(logs.length, 8); // Lots of events are emitted!
                        assert.equal(logs[7].event, 'ConvertedToCUSD');
                        assert.equal(logs[7].args.user, whitelisted);
                        assert(logs[7].args.amount.eq(fifty));
                    });
                    it('reverts when paused', async function () {
                        await this.tokenProxy.pause({ from:proxyOwner })
                        await expectRevert(this.tokenProxy.convertWT(fifty, { from: whitelisted }))
                    })
                });
                describe('user has insufficient funds', function () {
                    it('reverts', async function () {
                        await this.tokenProxy.mint(whitelisted, hundred, { from: minter });
                        await expectRevert(this.tokenProxy.convertWT(hundred.plus(1), { from: whitelisted }));
                    });
                });
            });
            describe('user does not have conversion permission', function () {
                it('call reverts', async function () {
                    await this.tokenProxy.mint(whitelisted, hundred, { from: minter });
                    await expectRevert(this.tokenProxy.convertWT(fifty, { from: nonlisted }));
                });
            });
        });
    });
})
