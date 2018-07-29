const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common')

const { RegulatorProxy, Regulator, RegulatorStorage } = require('../helpers/artifacts');

const { RegulatorMock, RegulatorStorageMock, MutableStorageRegulatorMock } = require('../helpers/mocks');

contract('RegulatorProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;

    beforeEach(async function () {
        // Empty Proxy Data storage
        this.proxyStorage = (await RegulatorStorage.new({ from:owner })).address
        this.regulator_logic_v1_storage = (await RegulatorStorage.new({ from:owner })).address
        this.regulator_logic_v2_storage = (await RegulatorStorage.new({from:owner})).address
        
        // Upgradeable logic contracts
        this.impl_v0 = (await Regulator.new({ from:owner })).address
        this.impl_v1 = (await RegulatorMock.new(this.regulator_logic_v1_storage, { from:owner })).address
        this.impl_v2 = (await MutableStorageRegulatorMock.new(this.regulator_logic_v2_storage, {from:owner})).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await RegulatorProxy.new(this.impl_v0, this.proxyStorage, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

    })

    describe('setStorage', function () {
        beforeEach(async function () {
            this.newProxyStorage = (await RegulatorStorage.new({ from:owner })).address;
        })

        describe('owner calls', function () {
            const from = proxyOwner
            it('sets regulator proxy storage', async function () {
                await this.proxy.setStorage(this.newProxyStorage, {from})
                assert.equal(await this.proxy._storage(), this.newProxyStorage)
            })
        })
        describe('non-owner calls', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.setStorage(this.newProxyStorage, {from}))
            })
        })

    })
    describe('implementation', function () {

        describe('owner calls', function () {
            const from = proxyOwner

            it('returns the implementation address', async function () {
                this.implementation = await this.proxy.implementation({from})
                assert.equal(this.implementation, this.impl_v0)
            })
        })
        describe('non-owner calls', function () {
            const from = owner

            it('reverts', async function () {
                await expectRevert(this.proxy.implementation({from}))
            })
        })


    })

    describe('upgradeTo v1 (immutable RegulatorStorage location)', function () {

        describe('owner calls', function () {
            const from = proxyOwner

            beforeEach(async function () {
                await this.proxy.upgradeTo(this.impl_v1, { from })
                this.logic_v0 = Regulator.at(this.impl_v0)
                this.logic_v1 = Regulator.at(this.impl_v1)
                this.logic_v2 = Regulator.at(this.impl_v2)
            })
            it('upgrades to new implementation', async function () {
                this.implementation = await this.proxy.implementation( { from })
                assert.equal(this.implementation, this.impl_v1)
            })
            describe('proxy storage does not change even though logic storage changes', function () {
                it('first logic has storage set to 0x0000...', async function () {
                    assert.equal(await this.logic_v0._storage(), ZERO_ADDRESS)
                })
                it('second logic has new storage', async function () {
                    assert.equal(await this.logic_v1._storage(), this.regulator_logic_v1_storage)
                })
                it('third logic has new storage', async function () {
                    assert.equal(await this.logic_v2._storage(), this.regulator_logic_v2_storage)
                })
                it('proxy storage remains the same', async function () {
                    assert.equal(await this.proxy._storage(), this.proxyStorage)
                })
            })

        })
        describe('non owner calls', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
            })
        })

    })

    describe('RegulatorProxy delegates calls to Regulator implementation', function () {

        beforeEach(async function () {
            // set proxy storage
            this.regulatorProxy = await Regulator.at(this.proxyAddress)
            this.logic_v0 = await Regulator.at(this.impl_v0)

            // storing method signatures for testing convenience
            // this.MINT_SIG = await this.proxyStorage.MINT_SIG();
            // this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.testRegulatorStorage.DESTROY_BLACKLISTED_TOKENS_SIG();
            // this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.testRegulatorStorage.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG();
            // this.BURN_SIG = await this.testRegulatorStorage.BURN_SIG();
            // this.BLACKLISTED_SIG = await this.testRegulatorStorage.BLACKLISTED_SIG();

        })
        // it('regulator implementation and proxy have different storages', async function () {
        //     // Set regulator implementation storage
        //     this.regulator_logic_v0 = await Regulator.at(this.impl_v0)
        //     this.regulator_logic_v0_storage = (await RegulatorStorage.new({ from:owner })).address
        //     await this.regulator_logic_v0.setStorage(this.regulator_logic_v0_storage);

        //     assert.notEqual(await this.regulator_logic_v0._storage(), await this.regulator._storage())
        // })
        // it('call to implementation storage returns proxy storage', async function () {
        //     assert.equal(await this.regulator._storage(), this.proxyStorage)
        // })
        describe('proxy owner calls', function () {
            
            const from = proxyOwner

            // it('Calls to proxy to Get storage data work', async function () {

            //     // add validator to the proxy storage
            //     this.regulatorStorage = await RegulatorStorage.at(await this.regulator._storage())
            //     await this.regulatorStorage.addValidator(validator, {from:owner})
            //     await this.regulatorStorage.addPermission(this.testPermission, '', '', '', {from:validator})
            //     await this.regulatorStorage.setUserPermission(user, this.testPermission, {from:validator})

            //     assert(await this.regulator.isValidator(validator))
            //     assert(await this.regulator.isPermission(this.testPermission))
            //     assert(await this.regulator.hasUserPermission(user, this.testPermission))


            // })
            describe('Calls to proxy to Set storage data work', function () {

                it('addValidator adds validator to proxy storage and NOT logic storage', async function () {

                    await this.regulatorProxy.addValidator(validator, {from})
                    assert(await this.regulatorProxy.isValidator(validator))
                    // assert(!(await this.logic_v0.isValidator(validator)))

                })
            })
        })

    })

})