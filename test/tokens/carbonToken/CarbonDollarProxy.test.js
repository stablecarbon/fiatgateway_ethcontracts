const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common')

const { tokenSetupCDProxy } = require('../../helpers/tokenSetupCDProxy')

const { tokenSetup } = require('../../helpers/tokenSetup')

const { CarbonDollarProxy, CarbonDollar, Regulator } = require('../../helpers/artifacts');

const { RegulatorMock } = require('../../helpers/mocks');

contract('CarbonDollarProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;
    const minter = commonVars.user3;
    const blacklisted = commonVars.attacker
    const anotherUser = commonVars.user5

    beforeEach(async function () {
        // Empty Proxy Data storage + fully loaded regulator
        this.proxyRegulator = (await RegulatorMock.new({from:validator})).address
        
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
            this.tokenProxyRegulator = Regulator.at(this.proxyRegulator)
            this.tokenProxy = CarbonDollar.at(this.proxyAddress)

            this.logic_v0 = CarbonDollar.at(this.impl_v0)
        })
        describe('call to proxy to set fee', function () {
            it('proxy sets fee on stablecoin', async function () {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
                await this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:proxyOwner})
                assert.equal(await this.tokenProxy.getFee(RANDOM_ADDRESS), 100)
            })
        })
        describe('call to proxy to list coin', function () {
            it('proxy whitelists stablecoin', async function () {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
                assert(await this.tokenProxy.isWhitelisted(RANDOM_ADDRESS))
                await this.tokenProxy.unlistToken(RANDOM_ADDRESS, {from:proxyOwner})
                assert(!(await this.tokenProxy.isWhitelisted(RANDOM_ADDRESS)))
            })
        })
        describe('call proxy to convertCarbonDollar, relies on PermissionedToken calls working correctly', function () {
            beforeEach(async function () {
                await tokenSetupCDProxy.call(this, this.tokenProxy.address, validator, minter, proxyOwner, blacklisted);
            })
            beforeEach(async function () {  
                // Whitelist the WT0 contract and add a fee
                await this.tokenProxy.setFee(this.wtToken.address, 100, { from: proxyOwner });  // 10% fee
                // Mint WT for user directly into CUSD (user is set as minter in token setup)
                await this.wtToken.mintCUSD(user, 100 * 10 ** 18, { from: minter });

                // Whitelisted account should have no WT tokens
                assert.equal(await this.wtToken.balanceOf(user), 0)
                // CUSD account should have WT tokens 
                assert.equal(await this.wtToken.balanceOf(this.tokenProxy.address), 100 * 10 ** 18)
                // Whitelisted account should have carbon dollars
                assert.equal(await this.tokenProxy.balanceOf(user), 100 * 10 ** 18)
            })
            it('converts user CUSD into WT0, minus a fee', async function () {
                // User now could call CarbonDollar.convertCarbonDollar to convert CUSD back into WT
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: user });
                assertBalance(this.wtToken, user, 45 * 10 ** 18); // User gets WT0 returned to them
                assertBalance(this.tokenProxy, user, 50 * 10 ** 18); // User's remaining CUSD balance
            });
            it('deposits fee into CarbonDollar contract address as CUSD', async function () {
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: user });
                assertBalance(this.tokenProxy, this.tokenProxy.address, 5 * 10 ** 18); // Fee deposited into Carbon account for transaction                         
            });
            it('diminishes amount in CUSD WT0 escrow account', async function () {
                await this.tokenProxy.convertCarbonDollar(this.wtToken.address, 50 * 10 ** 18, { from: user });
                assertBalance(this.wtToken, this.tokenProxy.address, 50 * 10 ** 18); // Carbon's remaining WT0 escrowed balance
            });
        })
    })

    describe('upgradeTo v1', function () {
        beforeEach(async function () {
            // Second logic contract 
            await tokenSetup.call(this, validator, minter, owner, blacklisted);
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
})