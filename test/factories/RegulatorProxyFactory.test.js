const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { RegulatorProxyFactory, 
        WhitelistedTokenRegulator, 
        CarbonDollarRegulator,
        RegulatorProxy } = require('../helpers/artifacts');

contract('Regulator Factory creating Regulators', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const whitelisted = commonVars.user3;
    const minterCD = commonVars.user4;
    const whitelistedCD = commonVars.user5;

    beforeEach(async function () {

        this.proxyFactory = await RegulatorProxyFactory.new({from: proxy_owner });

        this.impl_v0_whitelisted = await WhitelistedTokenRegulator.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })
        this.impl_v0_carbondollar = await CarbonDollarRegulator.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })

        this.MINT_SIG = await this.impl_v0_whitelisted.MINT_SIG()
        this.MINT_CUSD_SIG = await this.impl_v0_carbondollar.MINT_CUSD_SIG()
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

    describe('Delegating calls to Regulator Proxy', function () {
        beforeEach(async function () {
            await this.proxyFactory.createRegulatorProxy(this.impl_v0_whitelisted.address, {from: proxy_owner })
            await this.proxyFactory.createRegulatorProxy(this.impl_v0_carbondollar.address, {from: proxy_owner })

            this.proxy_0 = RegulatorProxy.at(await this.proxyFactory.getRegulatorProxy((await this.proxyFactory.getCount())-2))
            this.regulator_0 = WhitelistedTokenRegulator.at(this.proxy_0.address)
            this.proxy_1 = RegulatorProxy.at(await this.proxyFactory.getRegulatorProxy((await this.proxyFactory.getCount())-1))
            this.regulator_1 = CarbonDollarRegulator.at(this.proxy_1.address)

            // Claim ownership of newly created proxy   
            await this.regulator_1.claimOwnership({ from:proxy_owner})
            await this.regulator_0.claimOwnership({ from:proxy_owner})
        })
        it('regulator and proxy have same address', async function () {
            assert.equal(this.proxy_0.address, this.regulator_0.address)
            assert.equal(this.proxy_1.address, this.regulator_1.address)
        })
        it('initial implementation set by the proxy', async function () {
            assert.equal(await this.proxy_0.implementation(), this.impl_v0_whitelisted.address)
            assert.equal(await this.proxy_1.implementation(), this.impl_v0_carbondollar.address)
        })  
        it('proxy is owned by caller of factory createRegulator()', async function () {
            assert.equal(await this.proxy_0.owner(), proxy_owner)
            assert.equal(await this.regulator_0.owner(), proxy_owner)
            assert.equal(await this.regulator_1.owner(), proxy_owner)
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
                    await this.regulator_0.addPermission(0x12345678, "name","des","contract", {from: validator})
                })
                it('user gains permission', async function () {
                    await this.regulator_0.setUserPermission(minter, 0x12345678, {from: validator})
                    assert(await this.regulator_0.hasUserPermission(minter, 0x12345678))
                })
            })
        })

        describe('Proxy factory creates different types of regulators', function () {
            beforeEach(async function () {
                await this.regulator_0.addValidator(validator, {from: proxy_owner})
                await this.regulator_1.addValidator(validator, {from: proxy_owner})

                await this.regulator_0.setMinter(minter, {from: validator})   // WT
                await this.regulator_1.setMinter(minterCD, {from: validator}) // CD

                await this.regulator_0.setWhitelistedUser(whitelisted, {from: validator })   // WT
                await this.regulator_1.setWhitelistedUser(whitelistedCD, {from: validator }) // CD
            })
            it('regulators have different addresses', async function () {
                assert.notEqual(this.regulator_0.address, this.regulator_1.address)
            })
            it('CD minter is not a WT minter (lacks the mintCUSD sig)', async function () {
                assert(!(await this.regulator_0.isMinter(minterCD)))
                assert(await this.regulator_1.isMinter(minterCD))
            })
            it('WT minter is not a CD minter', async function () {
                assert(await this.regulator_0.isMinter(minter))
                assert(!(await this.regulator_1.isMinter(minter)))
            })
            it('CD whitelisted is not whitelisted on WT', async function () {
                assert(await this.regulator_0.isWhitelistedUser(whitelisted))
                assert(!(await this.regulator_1.isWhitelistedUser(whitelisted)))
            })
            it('WT whitelisted is not whitelisted on CD', async function () {
                assert(!(await this.regulator_0.isWhitelistedUser(whitelistedCD)))
                assert(await this.regulator_1.isWhitelistedUser(whitelistedCD))
            })
        })
    })
})