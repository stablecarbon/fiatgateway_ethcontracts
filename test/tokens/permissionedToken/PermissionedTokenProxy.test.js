const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../../helpers/common')

const { PermissionedTokenProxy, PermissionedToken, Regulator } = require('../../helpers/artifacts');

const { RegulatorMock } = require('../../helpers/mocks');

contract('PermissionedTokenProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;

    beforeEach(async function () {
        // Empty Proxy Data storage + fully loaded regulator
        this.proxyRegulator = (await RegulatorMock.new({from:validator})).address
        
        // First logic contract
        this.impl_v0 = (await PermissionedToken.new(this.proxyRegulator, { from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await PermissionedTokenProxy.new(this.impl_v0, this.proxyRegulator, { from:proxyOwner })
        this.proxyAddress = this.proxy.address
    })
    describe('implementation', function () {
        const from = proxyOwner
        it('returns the Token implementation address', async function () {
            this.implementation = await this.proxy.implementation({from})
            assert.equal(this.implementation, this.impl_v0)
        })
    })

    describe('Proxy delegates calls to logic contract', function () {
        beforeEach(async function () {
            this.tokenProxy = PermissionedToken.at(this.proxyAddress)
            this.logic_v0 = PermissionedToken.at(this.impl_v0)
            this.tokenProxyRegulator = Regulator.at(this.proxyRegulator)

            await this.tokenProxyRegulator.setMinter(owner, {from:validator})
        })
        describe('call to proxy to mint', function () {
            it('proxy mints to whitelisted user', async function () {
                await this.tokenProxy.mint(user, 10 * 10 ** 18, {from:owner})
                assert.equal(await this.tokenProxy.balanceOf(user), 10 * 10 ** 18)
            })
        })
        describe('regulator', function () {
            it('regulator is same for proxy and token', async function () {
                assert.equal(await this.tokenProxyRegulator.address, await this.tokenProxy.regulator())
            })
        })
        describe('setRegulator', function () {
            beforeEach(async function () {
                this.newRegulator = await RegulatorMock.new({from:owner})
            })
            describe('owner calls', function () {
                it('changes regulator', async function () {
                    await this.tokenProxy.setRegulator(this.newRegulator.address, {from:proxyOwner});
                    assert.equal(await this.tokenProxy.regulator(), this.newRegulator.address)
                })
            })
            describe('non owner calls', function () {
                it('reverts', async function () {
                    await expectRevert(this.tokenProxy.setRegulator(this.newRegulator.address, {from:owner}))
                })
            })
        })
    })

    describe('upgradeTo v1', function () {

        beforeEach(async function () {
            // Second logic contract 
            this.token_logic_v1_regulator = (await RegulatorMock.new({ from:owner })).address
            this.impl_v1 = (await PermissionedToken.new(this.token_logic_v1_regulator, { from:owner })).address
        })
        describe('owner calls upgradeTo', function () {
            const from = proxyOwner

            beforeEach(async function () {
                const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
                this.tokenProxy = PermissionedToken.at(this.proxyAddress)

                this.logic_v0 = PermissionedToken.at(this.impl_v0)
                this.logic_v1 = PermissionedToken.at(this.impl_v1)

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
        describe('Regulator implementation owner calls upgradeTo', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
            })
        })
    })
})