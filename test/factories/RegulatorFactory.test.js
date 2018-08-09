const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { RegulatorProxyFactory, RegulatorLogicFactory, Regulator, RegulatorProxy, PermissionSheet, ValidatorSheet } = require('../helpers/artifacts');

contract('Regulator Factory creating Regulators', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const minter = commonVars.owner;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;
    const whitelisted = commonVars.user2;
    const Nonlisted = commonVars.user3;
    const Blacklisted = commonVars.validator2;

    beforeEach(async function () {

        this.proxyFactory = await RegulatorProxyFactory.new();
        this.logicFactory = await RegulatorLogicFactory.new();

    })

    describe('Creating a brand new Regulator logic and proxy from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
            assert.equal(await this.logicFactory.getCount(), 0)
        })
        it('logic creates a new regulator', async function () {
            const { logs } = await this.logicFactory.createRegulator()
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedRegulatorLogic")
            assert.equal(logs[0].args.newRegulator, await this.logicFactory.getRegulator(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.logicFactory.getCount(), 1)
        })
        it('proxy creates a new regulator', async function () {
            await this.logicFactory.createRegulator()
            const { logs } = await this.proxyFactory.createRegulator(await this.logicFactory.getRegulator(0))
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedRegulatorProxy")
            assert.equal(logs[0].args.newRegulator, await this.proxyFactory.getRegulator(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    
    })

    describe('getRegulator', function () {
        beforeEach(async function () {
            await this.logicFactory.createRegulator()
            await this.logicFactory.createRegulator()
            await this.proxyFactory.createRegulator(await this.logicFactory.getRegulator(0))
            await this.proxyFactory.createRegulator(await this.logicFactory.getRegulator(1))

        })
        it('i is negative, reverts', async function () {
            await expectRevert(this.logicFactory.getRegulator(-1))
            await expectRevert(this.proxyFactory.getRegulator(-1))
        })
        it('i is equal to or greater than length, reverts', async function () {
            await expectRevert(this.logicFactory.getRegulator(2))
            await expectRevert(this.proxyFactory.getRegulator(2))
            await expectRevert(this.logicFactory.getRegulator(3))
            await expectRevert(this.proxyFactory.getRegulator(3))
        })
        it('i >= 0 and < length, retrieves regulator', async function () {
            assert.equal(await this.logicFactory.getRegulator(1), await this.logicFactory.regulators(1))
            assert.equal(await this.proxyFactory.getRegulator(1), await this.proxyFactory.regulators(1))

        })
    })

    describe('Casting children to Regulator and RegulatorProxy', function () {
        const from = validator // Proxy owner
        beforeEach(async function () {
            await this.logicFactory.createRegulator()
            this.model_0 = Regulator.at(await this.logicFactory.getRegulator((await this.logicFactory.getCount())-1))
            await this.proxyFactory.createRegulator(this.model_0.address, {from})
            this.proxy_0 = RegulatorProxy.at(await this.proxyFactory.getRegulator((await this.proxyFactory.getCount())-1))
            this.regulator_0 = Regulator.at(this.proxy_0.address)

            this.permissions_0 = PermissionSheet.at(await this.regulator_0.permissions())
            this.validators_0 = ValidatorSheet.at(await this.regulator_0.validators())
        })
        it('regulator and proxy have same address', async function () {
            assert.equal(this.proxy_0.address, this.regulator_0.address)
        })
        it('initial implementation set by the proxy', async function () {
            assert.equal(await this.proxy_0.implementation(), this.model_0.address)
        })  
        it('proxy is owned by caller of factory createRegulator()', async function () {
            assert.equal(await this.proxy_0.owner(), validator)
            assert.equal(await this.regulator_0.owner(), validator)
        }) 
        it('Proxy data stores are owned by regulator', async function () {
            assert.equal(await this.permissions_0.owner(), this.regulator_0.address)
            assert.equal(await this.validators_0.owner(), this.regulator_0.address)
        })
        it('Proxy can change storage', async function () {
            const newPermissions = await PermissionSheet.new()
            const newValidators = await ValidatorSheet.new()

            await this.regulator_0.setPermissionStorage(newPermissions.address, {from})
            await this.regulator_0.setValidatorStorage(newValidators.address, {from})

            assert.equal(newPermissions.address, await this.regulator_0.permissions())
            assert.equal(newValidators.address, await this.regulator_0.validators())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
                await this.logicFactory.createRegulator()

                this.model_1 = Regulator.at(await this.logicFactory.getRegulator((await this.logicFactory.getCount())-1))
    
                const { logs } = await this.proxy_0.upgradeTo(this.model_1.address, {from}) 
                assert.equal(await this.proxy_0.implementation(), this.model_1.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.model_1.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {
            describe('owner calls addValidator', function () {
                it('adds a validator to validator sheet', async function () {
                    await this.regulator_0.addValidator(validator, {from})
                    assert(await this.regulator_0.isValidator(validator))
                })
            })
            describe('non owner calls addValidator', function () {
                it('reverts', async function () {
                    await expectRevert(this.regulator_0.addValidator(validator, {from:minter}))
                })
            })  
            describe('validator calls addPermission', function () {
                it('adds permission', async function () {
                    await this.regulator_0.addValidator(validator, {from})
                    await this.regulator_0.addPermission(0x12345678, "name","des","contract", {from})
                    assert(await this.regulator_0.isPermission(0x12345678))
                })
            })
            describe('non validator calls addPermission', function () {
                it('reverts', async function () {
                    await this.regulator_0.addValidator(validator, {from})
                    await expectRevert(this.regulator_0.addPermission(0x12345678, "name", "des", "contract", {from:minter}))
                })
            })
            describe('validator sets user permission', function () {
                beforeEach(async function () {
                    await this.regulator_0.addValidator(validator, {from})
                })
                it('sets a minter', async function () {
                    await this.regulator_0.setMinter(minter, {from})
                    assert(await this.regulator_0.isMinter(minter))
                })
                it('sets a whitelisted user', async function () {
                    await this.regulator_0.setWhitelistedUser(whitelisted, {from})
                    assert(await this.regulator_0.isWhitelistedUser(whitelisted))
                })
            })
        })
    })

    // describe('Creating a Whitelisted Regulator', function () {
    //     const from = validator // Proxy owner
    //     it('logic creates a new whietlisted regulator', async function () {
    //         const { logs } = await this.logicFactory.createWhitelistedRegulator()
    //         assert.equal(logs.length, 1)
    //         assert.equal(logs[0].event, "CreatedWhielistedRegulatorLogic")
    //         assert.equal(logs[0].args.newRegulator, await this.logicFactory.getRegulator(0))
    //         assert.equal(logs[0].args.index, 0)
    //         assert.equal(await this.logicFactory.getCount(), 1)
    //     })
    // })




})