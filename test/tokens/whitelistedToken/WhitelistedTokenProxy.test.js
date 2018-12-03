const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common')

const { tokenSetup } = require('../../helpers/tokenSetup')

const { WhitelistedTokenProxy, WhitelistedToken, CarbonDollar } = require('../../helpers/artifacts');

const { RegulatorMock } = require('../../helpers/mocks');

contract('WhitelistedTokenProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;
    const minter = commonVars.user3;
    const blacklisted = commonVars.attacker
    const anotherUser = commonVars.user5

    beforeEach(async function () {
        // Empty Proxy Data storage + fully loaded regulator (all permissions + 1 validator)
        this.proxyRegulator = (await RegulatorMock.new({from:owner})).address
        
        this.proxyCUSD = (await CarbonDollar.new(ZERO_ADDRESS, {from:owner})).address
        // First logic contract
        this.impl_v0 = (await WhitelistedToken.new(this.proxyRegulator, this.proxyCUSD)).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await WhitelistedTokenProxy.new(this.impl_v0, this.proxyRegulator, this.proxyCUSD, { from:proxyOwner })
        this.proxyAddress = this.proxy.address
    })

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
            await tokenSetup.call(this, validator, minter, owner, blacklisted);
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
})