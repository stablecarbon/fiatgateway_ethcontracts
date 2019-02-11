const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common')

const { RegulatorProxy, Regulator } = require('../helpers/artifacts');

const { RegulatorMock } = require('../helpers/mocks');

contract('RegulatorProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;

    beforeEach(async function () {        
        // Upgradeable logic contracts
        this.impl_v0 = (await Regulator.new({ from:owner })).address
        this.impl_v1 = (await Regulator.new({ from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await RegulatorProxy.new(this.impl_v0, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

        this.MINT_SIG = await (await Regulator.at(this.proxyAddress)).MINT_SIG();

    })

    describe('implementation', function () {
        it('returns the Regulator implementation address', async function () {
            this.implementation = await this.proxy.implementation({ from: user })
            assert.equal(this.implementation, this.impl_v0)
        })
    })
    describe('before upgrading to v1', function () {
        beforeEach(async function () {
            this.regulatorProxy = Regulator.at(this.proxyAddress)
            this.logic_v0 = Regulator.at(this.impl_v0)
        })
        describe('call to proxy to addValidator', function () {

            it('proxy has its own storage and can set a validator but does NOT set logic contract storage', async function () {

                assert(!(await this.regulatorProxy.isValidator(validator)))
                await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
                assert(await this.regulatorProxy.isValidator(validator))
                assert(!(await this.logic_v0.isValidator(validator)))
            })
        })
    })

    describe('upgradeTo v1', function () {

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
            describe('Calls proxy', function () {

                describe('addValidator', function () {
                    describe('proxyOwner calls', function () {
                        const from = proxyOwner
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
                        await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
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
                        await this.regulatorProxy.addValidator(validator, { from:proxyOwner })
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
                            assert(permissions[3])
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
                        await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
                        await this.regulatorProxy.addPermission(this.MINT_SIG,'MINT','users can mint','minting is fun', {from:validator})
                        await this.logic_v1.addValidator(validator, {from:owner})
                        await this.logic_v1.addPermission(this.MINT_SIG,'MINT','users can mint','minting is fun', {from:validator})
                    })

                    describe('validator calls', function () {
                        const from = validator
                        it('removes permission from proxy storage and NOT logic storage', async function () {
                            await this.regulatorProxy.removePermission(this.MINT_SIG, {from})
                            assert(!(await this.regulatorProxy.isPermission(this.MINT_SIG)))
                            const permissions = await this.regulatorProxy.getPermission(this.MINT_SIG);
                            assert.equal(permissions[0], 'MINT');
                            assert.equal(permissions[1], 'users can mint');
                            assert.equal(permissions[2], 'minting is fun');
                            assert(!permissions[3])
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
                        await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
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
                        await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
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
                        await this.regulatorProxy.addValidator(validator, {from:proxyOwner})
                        await this.regulatorProxy.addPermission(this.MINT_SIG, '', '', '', {from:validator})
                    })
                    describe('setMinter', function () {
                        it('emits a LogSetMinter event', async function () {
                            const { logs } = await this.regulatorProxy.setMinter(user, {from:validator})
                            this.logs = logs
                            this.event = this.logs.find(l => l.event === 'LogSetMinter').event
                            this.who = this.logs.find(l => l.event === 'LogSetMinter').args.who

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