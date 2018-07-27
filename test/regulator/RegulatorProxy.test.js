const { CommonVariables, ZERO_ADDRESS } = require('../helpers/common')

const { RegulatorProxy, Regulator, RegulatorStorage } = require('../helpers/artifacts');

contract('RegulatorProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;

    beforeEach(async function () {
        // Proxy Data storage
        this.proxy_storage = (await RegulatorStorage.new({ from:owner })).address
        
        // Upgradeable logic
        this.impl_v0 = (await Regulator.new({ from:owner })).address
        this.impl_v1 = (await Regulator.new({ from:owner })).address

        // Setting up Proxy initially at version 0
        this.proxy = await RegulatorProxy.new(this.impl_v0, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

    })

    describe('proxy storage', function () {
        it('sets regulator proxy storage', async function () {
            await this.proxy.setStorage(this.proxy_storage, {from:owner})
            assert.equal(await this.proxy._storage(), this.proxy_storage)
        })
    })
    describe('implementation', function () {

        it('returns the implementation address', async function () {
            this.implementation = await this.proxy.implementation( { from:proxyOwner })
            assert.equal(this.implementation, this.impl_v0)
        })

    })

    describe('upgradeTo', function () {

        describe('proxy owner calls', function () {
            const from = proxyOwner
            it('upgrades to new implementation', async function () {
                await this.proxy.upgradeTo(this.impl_v1, { from })
                this.implementation = await this.proxy.implementation( { from })
                assert.equal(this.implementation, this.impl_v1)
            })
        })
        describe('non proxy owner calls', function () {

        })

    })

    describe('regulator delegates calls to implementation', function () {

        beforeEach(async function () {
            // set proxy storage
            await this.proxy.setStorage(this.proxy_storage, {from:owner})
            this.regulator = await Regulator.at(this.proxyAddress)

        })
        it('regulator implementation and proxy have different storages', async function () {
            // Set regulator implementation storage
            this.regulator_logic_v0 = await Regulator.at(this.impl_v0)
            this.regulator_logic_v0_storage = (await RegulatorStorage.new({ from:owner })).address
            await this.regulator_logic_v0.setStorage(this.regulator_logic_v0_storage);

            assert.notEqual(await this.regulator_logic_v0._storage(), await this.proxy._storage())
        })
        it('call to implementation storage returns proxy storage', async function () {
            assert.equal(await this.regulator._storage(), this.proxy_storage)
        })
        it('call to add validator adds validator to proxy storage', async function () {
            this.regulator_logic_v0 = await Regulator.at(this.impl_v0)
            console.log('proxy owner: ' + await this.regulator.owner({from:owner}))
            console.log('impl_v0 owner before: ' + await this.regulator_logic_v0.owner({from:owner}))
            await this.regulator_logic_v0.transferOwnership(await this.regulator.owner(), {from:owner})
            console.log('impl_v0 owner after: ' + await this.regulator_logic_v0.owner({from:owner}))

            // await this.regulator.addValidator(validator, {from:owner})
        })
    })

})