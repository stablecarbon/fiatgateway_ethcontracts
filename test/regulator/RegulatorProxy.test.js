const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common')

const { RegulatorProxy, Regulator, RegulatorStorage } = require('../helpers/artifacts');

const { RegulatorMock, RegulatorStorageMock } = require('../helpers/mocks');

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
        
        // Upgradeable logic contracts
        this.impl_v0 = (await Regulator.new({ from:owner })).address
        this.impl_v1 = (await RegulatorMock.new(this.regulator_logic_v1_storage, { from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await RegulatorProxy.new(this.impl_v0, this.proxyStorage, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

        this.MINT_SIG = await (await RegulatorStorage.at(this.proxyStorage)).MINT_SIG();
        // this.DESTROY_BLACKLISTED_TOKENS_SIG = (await RegulatorStorage.at(this.proxyStorage)).DESTROY_BLACKLISTED_TOKENS_SIG();
        // this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = (await RegulatorStorage.at(this.proxyStorage)).APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG();
        // this.BURN_SIG = (await RegulatorStorage.at(this.proxyStorage)).BURN_SIG();
        // this.BLACKLISTED_SIG = (await RegulatorStorage.at(this.proxyStorage)).BLACKLISTED_SIG();


    })

    describe('setStorage', function () {
        beforeEach(async function () {
            this.newProxyStorage = (await RegulatorStorage.new({ from:owner })).address;
            this.logic_v0 = await Regulator.at(this.impl_v0)
        })

        describe('owner calls', function () {
            const from = proxyOwner
            beforeEach(async function () {

                const { logs } = await this.proxy.setStorage(this.newProxyStorage, {from})
                this.logs = logs
                this.event = this.logs.find(l => l.event === 'ChangedRegulatorStorage').event
                this.oldAddress = this.logs.find(l => l.event === 'ChangedRegulatorStorage').args._old
                this.newAddress = this.logs.find(l => l.event === 'ChangedRegulatorStorage').args._new

            })
            it('sets regulator proxy storage', async function () {
                assert.equal(await this.proxy._storage(), this.newProxyStorage)
            })
            it('emits a ChangedRegulatorStorage event', async function () {
                assert.equal(this.logs.length, 1)
                assert.equal(this.oldAddress, this.proxyStorage)
                assert.equal(this.newAddress, this.newProxyStorage)
            })
            it('does not change regulator implementation storage', async function () {
                assert.equal(await this.logic_v0._storage(), ZERO_ADDRESS)
            })
            describe('setStorage to another RegulatorStorage with all permissions set', function () {
                beforeEach(async function () {
                    this.regulatorProxy = await Regulator.at(this.proxyAddress)
                })

                it('before setting storage, Regulator proxy has no permissions', async function () {
                    assert(!(await this.regulatorProxy.isPermission(this.MINT_SIG)))
                })
                it('after setting storage, Regulator proxy has new storage with all permissions set', async function () {
                    this.newProxyStorageWithPermissions = (await RegulatorStorageMock.new(validator, {from})).address
                    await this.proxy.setStorage(this.newProxyStorageWithPermissions, {from})
                    assert(await this.regulatorProxy.isPermission(this.MINT_SIG))
                })
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

            it('returns the Regulator implementation address', async function () {
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

    describe('before upgrading to v1', function () {

        beforeEach(async function () {

            this.regulatorProxy = Regulator.at(this.proxyAddress)
            this.logic_v0 = Regulator.at(this.impl_v0)

        })
        describe('call to proxy to addValidator', function () {

            it('logic_v0 has storage set to 0x000... and reverts', async function () {
                await expectRevert(this.logic_v0.addValidator(validator, {from:owner}))
            })
            it('proxy has its own storage and can set a validator', async function () {
                assert(!(await this.regulatorProxy.isValidator(validator)))
                await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
                assert(await this.regulatorProxy.isValidator(validator))
            })
        })
    })

    describe('upgradeTo v1 (immutable RegulatorStorage location)', function () {

        describe('owner calls upgradeTo', function () {
            const from = proxyOwner

            beforeEach(async function () {
                const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
                this.regulatorProxy = Regulator.at(this.proxyAddress)

                this.logic_v0 = Regulator.at(this.impl_v0)
                this.logic_v1 = Regulator.at(this.impl_v1)

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
            describe('proxy storage does not change even though logic storage changes', function () {
                it('V0 logic has storage set to 0x0000...', async function () {
                    assert.equal(await this.logic_v0._storage(), ZERO_ADDRESS)
                })
                it('V1 logic has its own storage', async function () {
                    assert.equal(await this.logic_v1._storage(), this.regulator_logic_v1_storage)
                })
                it('proxy storage remains the same', async function () {
                    assert.equal(await this.proxy._storage(), this.proxyStorage)
                })
            })
            describe('Calls proxy', function () {

                describe('addValidator', function () {

                    describe('proxyOwner calls', function () {

                        it('adds validator to proxy storage and NOT logic storage', async function () {

                            await this.regulatorProxy.addValidator(validator, {from})
                            assert(await this.regulatorProxy.isValidator(validator))
                            assert(!(await this.logic_v1.isValidator(validator)))

                        })
                    })
                    describe('regulator implementation owner calls', function () {

                        const from = owner

                        it('reverts', async function () {

                            await expectRevert(this.regulatorProxy.addValidator(validator, {from}))

                        })
                    })
                })

                describe('removeValidator', function () {

                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, {from})
                        await this.logic_v1.addValidator(validator, {from:owner})
                    })
                    describe('proxyOwner calls', function () {

                        const from = proxyOwner

                        it('removes validator from proxy storage and NOT logic storage', async function () {
                            await this.regulatorProxy.removeValidator(validator, {from})
                            assert(!(await this.regulatorProxy.isValidator(validator)))
                            assert(await this.logic_v1.isValidator(validator))
                        })
                    })
                    describe('regulator implementation owner calls', function () {

                        const from = owner

                        it('reverts', async function () {

                            await expectRevert(this.regulatorProxy.removeValidator(validator, {from}))
                        })
                    })
                })

                describe('addPermission', function () {

                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, { from })
                    })
                    describe('validator calls', function () {

                        const from = validator
                        it('adds permission to proxy storage and NOT logic storage', async function () {

                            await this.regulatorProxy.addPermission(this.MINT_SIG,'MINT','users can mint','minting is fun', {from})
                            assert(await this.regulatorProxy.isPermission(this.MINT_SIG))
                            const permissions = await this.regulatorProxy.getPermission(this.MINT_SIG);
                            assert.equal(permissions[0], 'MINT');
                            assert.equal(permissions[1], 'users can mint');
                            assert.equal(permissions[2], 'minting is fun');
                            assert(!(await this.logic_v1.isPermission(this.MINT_SIG)))

                        })

                    })
                    describe('non validator calls', function () {

                        it('reverts', async function () {

                            await expectRevert(this.regulatorProxy.addPermission(this.MINT_SIG,'','','', {from:owner}))
                            await expectRevert(this.regulatorProxy.addPermission(this.MINT_SIG,'','','', {from:proxyOwner}))

                        })
                    })
                })

                describe('removePermission', function () {

                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, {from})
                        await this.regulatorProxy.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                        await this.logic_v1.addValidator(validator, {from:owner})
                        await this.logic_v1.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                    })

                    describe('validator calls', function () {

                        const from = validator
                        it('removes permission from proxy storage and NOT logic storage', async function () {

                            await this.regulatorProxy.removePermission(this.MINT_SIG, {from})
                            assert(!(await this.regulatorProxy.isPermission(this.MINT_SIG)))
                            assert(await this.logic_v1.isPermission(this.MINT_SIG))
                        })

                    })
                    describe('non validator calls', function () {

                        it('reverts', async function() {
                            await expectRevert(this.regulatorProxy.removePermission(this.MINT_SIG), {from:owner})
                            await expectRevert(this.regulatorProxy.removePermission(this.MINT_SIG), {from:proxyOwner})
                        })
                    })

                })

                describe('setUserPermission', function () {

                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, {from})
                        await this.regulatorProxy.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                        await this.logic_v1.addValidator(validator, {from:owner})
                        await this.logic_v1.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                    })

                    describe('validator calls', function () {
                        const from = validator
                        it('sets user permission to proxy storage and NOT logic storage', async function () {

                            await this.regulatorProxy.setUserPermission(user, this.MINT_SIG, {from})
                            assert(await this.regulatorProxy.hasUserPermission(user, this.MINT_SIG))
                            assert(!(await this.logic_v1.hasUserPermission(user, this.MINT_SIG)))
                        })
                    })

                    describe('non-validator calls', function () {
                        it('reverts', async function () {
                            await expectRevert(this.regulatorProxy.setUserPermission(user, this.MINT_SIG, {from:owner}))
                            await expectRevert(this.regulatorProxy.setUserPermission(user, this.MINT_SIG, {from:proxyOwner}))
                        })
                    })
                })

                describe('removeUserPermission', function () {

                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, {from})
                        await this.regulatorProxy.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                        await this.logic_v1.addValidator(validator, {from:owner})
                        await this.logic_v1.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                        await this.regulatorProxy.setUserPermission(user, this.MINT_SIG, {from:validator})
                        await this.logic_v1.setUserPermission(user, this.MINT_SIG, {from:validator})
                    })

                    describe('validator calls', function () {
                        const from = validator
                        it('removes user permission from proxy storage and NOT logic storage', async function () {

                            await this.regulatorProxy.removeUserPermission(user, this.MINT_SIG, {from})
                            assert(!(await this.regulatorProxy.hasUserPermission(user, this.MINT_SIG)))
                            assert(await this.logic_v1.hasUserPermission(user, this.MINT_SIG))

                        })
                    })

                    describe('non-validator calls', function () {
                        it('reverts', async function () {
                            await expectRevert(this.regulatorProxy.removeUserPermission(user, this.MINT_SIG, {from:owner}))
                            await expectRevert(this.regulatorProxy.removeUserPermission(user, this.MINT_SIG, {from:proxyOwner}))
                        })
                    })
                })

                describe('Regulator events emit', function () {
                    beforeEach(async function () {
                        await this.regulatorProxy.addValidator(validator, {from})
                        await this.regulatorProxy.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                    })
                    describe('setMinter', function () {
                        it('emits a SetMinter event', async function () {
                            const { logs } = await this.regulatorProxy.setMinter(user, {from:validator})
                            this.logs = logs
                            this.event = this.logs.find(l => l.event === 'SetMinter').event
                            this.who = this.logs.find(l => l.event === 'SetMinter').args.who

                            assert.equal(this.logs.length, 1)
                            assert.equal(this.who, user)
                        })
                    })
                })

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