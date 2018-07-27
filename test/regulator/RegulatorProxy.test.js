const { CommonVariables, ZERO_ADDRESS } = require('../helpers/common')

const { RegulatorProxy, Regulator, RegulatorStorage } = require('../helpers/artifacts');

const { RegulatorMock } = require('../helpers/mocks');

contract('RegulatorProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const minter = commonVars.user;

    beforeEach(async function () {
        this.storage_v1 = (await RegulatorStorage.new({ from:owner })).address
        this.impl_v0 = (await Regulator.new({ from:owner })).address

        this.proxy = await AdminUpgradeabilityProxy.new(this.impl_v0, { from:owner })
        this.proxyAddress = this.proxy.address
    })

    describe('implementation', function () {

        it('returns the implementation address', async function () {
            let regulator = await Regulator.at(this.proxyAddress)
            this.implementation = await this.proxy.implementation( { from:owner })
            assert.equal(this.implementation, this.impl_v0)
        })

    })

    describe('upgradeTo', function () {

        it('upgrades to new implementation', async function () {
            await this.proxy.upgradeTo(this.impl_v1, { from:owner })
            let regulator = await Regulator.at(this.proxyAddress)
            this.implementation = await this.proxy.implementation( { from:owner })
            assert.equal(this.implementation, this.impl_v1)
        })
    })

    describe('function call to regulator address', function () {

        it('delegates calls to latest implementation', async function () {
            let regulator_implementation = await Regulator.at(this.impl_v0)
            console.log(await regulator_implementation.owner())
            console.log(owner)
            let regulator = await Regulator.at(this.proxyAddress)
            // let permissions = await regulator.permissions()

            // let permissions = await PermissionsStorage.new({ from:owner })
            // await regulator.setPermissionsStorage(permissions.address, { from:owner })
            // console.log(permissions.address)
            // assert.equal(await regulator.permissions(), permissions.address)
        })
    })

})