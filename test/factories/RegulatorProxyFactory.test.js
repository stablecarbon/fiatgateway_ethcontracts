const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { RegulatorProxyFactory, 
        WhitelistedTokenRegulator, 
        CarbonDollarRegulator,
        RegulatorProxy, 
        PermissionSheet, 
        ValidatorSheet } = require('../helpers/artifacts');

contract('Regulator Factory creating Regulators', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const whitelisted = commonVars.user3;

    beforeEach(async function () {

        this.proxyFactory = await RegulatorProxyFactory.new({from: proxy_owner });

        this.impl_v0_whitelisted = await WhitelistedTokenRegulator.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })
        this.impl_v0_carbondollar = await CarbonDollarRegulator.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })

    })

    describe('Creating brand new Regulator proxies from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
        })
        it('proxy creates a new WhitelistedToken regulator', async function () {
            const { logs } = await this.proxyFactory.createRegulatorProxy(this.impl_v0_whitelisted.address)
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedRegulatorProxy")
            assert.equal(logs[0].args.newRegulator, await this.proxyFactory.getRegulatorProxy(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
        it('proxy creates a new CarbonDollar regulator', async function () {
            const { logs } = await this.proxyFactory.createRegulatorProxy(this.impl_v0_carbondollar.address)
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedRegulatorProxy")
            assert.equal(logs[0].args.newRegulator, await this.proxyFactory.getRegulatorProxy(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    
    })

    describe('getRegulator', function () {
        beforeEach(async function () {
            await this.proxyFactory.createRegulatorProxy(this.impl_v0_whitelisted.address)
            await this.proxyFactory.createRegulatorProxy(this.impl_v0_carbondollar.address)

        })
        it('i is negative, reverts', async function () {
            await expectRevert(this.proxyFactory.getRegulatorProxy(-1))
        })
        it('i is equal to or greater than length, reverts', async function () {
            await expectRevert(this.proxyFactory.getRegulatorProxy(2))
            await expectRevert(this.proxyFactory.getRegulatorProxy(3))
        })
        it('i >= 0 and < length, retrieves regulator', async function () {
            assert.equal(await this.proxyFactory.getRegulatorProxy(1), await this.proxyFactory.regulators(1))

        })
    })

    describe('Casting children to Regulator and RegulatorProxy', function () {
        beforeEach(async function () {
            await this.proxyFactory.createRegulatorProxy(this.impl_v0_whitelisted.address, {from: proxy_owner })

            this.proxy_0 = RegulatorProxy.at(await this.proxyFactory.getRegulatorProxy((await this.proxyFactory.getCount())-1))
            this.regulator_0 = WhitelistedTokenRegulator.at(this.proxy_0.address)

            // Claim ownership of newly created proxy   
            await this.regulator_0.claimOwnership({ from:proxy_owner})

            this.permissions_0 = PermissionSheet.at(await this.regulator_0.permissions())
            this.validators_0 = ValidatorSheet.at(await this.regulator_0.validators())
        })
        it('regulator and proxy have same address', async function () {
            assert.equal(this.proxy_0.address, this.regulator_0.address)
        })
        it('initial implementation set by the proxy', async function () {
            assert.equal(await this.proxy_0.implementation(), this.impl_v0_whitelisted.address)
        })  
        it('proxy is owned by caller of factory createRegulator()', async function () {
            assert.equal(await this.proxy_0.owner(), proxy_owner)
            assert.equal(await this.regulator_0.owner(), proxy_owner)
        }) 
        it('Proxy data stores are owned by regulator', async function () {
            assert.equal(await this.permissions_0.owner(), this.regulator_0.address)
            assert.equal(await this.validators_0.owner(), this.regulator_0.address)
        })
        it('Proxy can change storage', async function () {
            const newPermissions = await PermissionSheet.new()
            const newValidators = await ValidatorSheet.new()

            await this.regulator_0.setPermissionStorage(newPermissions.address, {from: proxy_owner})
            await this.regulator_0.setValidatorStorage(newValidators.address, {from: proxy_owner})

            assert.equal(newPermissions.address, await this.regulator_0.permissions())
            assert.equal(newValidators.address, await this.regulator_0.validators())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
    
                const { logs } = await this.proxy_0.upgradeTo(this.impl_v0_carbondollar.address, {from: proxy_owner}) 
                assert.equal(await this.proxy_0.implementation(), this.impl_v0_carbondollar.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.impl_v0_carbondollar.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {
            describe('owner calls addValidator', function () {
                it('adds a validator to validator sheet', async function () {
                    await this.regulator_0.addValidator(validator, {from: proxy_owner})
                    assert(await this.regulator_0.isValidator(validator))
                })
            })
            describe('non owner calls addValidator', function () {
                it('reverts', async function () {
                    await expectRevert(this.regulator_0.addValidator(validator, {from: other_owner}))
                })
            })  
            describe('validator calls addPermission', function () {
                it('adds permission', async function () {
                    await this.regulator_0.addValidator(validator, {from: proxy_owner})
                    await this.regulator_0.addPermission(0x12345678, "name","des","contract", {from: validator})
                    assert(await this.regulator_0.isPermission(0x12345678))
                })
            })
            describe('non validator calls addPermission', function () {
                it('reverts', async function () {
                    await this.regulator_0.addValidator(validator, {from: proxy_owner})
                    await expectRevert(this.regulator_0.addPermission(0x12345678, "name", "des", "contract", {from:other_owner}))
                })
            })
            describe('validator sets user permission', function () {
                beforeEach(async function () {
                    await this.regulator_0.addValidator(validator, {from: proxy_owner})
                })
                it('sets a minter', async function () {
                    await this.regulator_0.setMinter(minter, {from: validator})
                    assert(await this.regulator_0.isMinter(minter))
                })
                it('sets a whitelisted user', async function () {
                    await this.regulator_0.setWhitelistedUser(whitelisted, {from: validator})
                    assert(await this.regulator_0.isWhitelistedUser(whitelisted))
                })
            })
        })
    })
})