const { CommonVariables, ZERO_ADDRESS, expectRevert, assertBalance } = require('../helpers/common');

const { PermissionedTokenLogicFactory, PermissionedTokenProxyFactory, RegulatorProxyFactory, RegulatorLogicFactory, PermissionedToken, PermissionedTokenProxy, BalanceSheet, AllowanceSheet, Regulator } = require('../helpers/artifacts');

var BigNumber = require("bignumber.js");

contract('Regulator Factory creating Regulators', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const minter = commonVars.owner;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;
    const whitelisted = commonVars.user2;
    const Nonlisted = commonVars.user3;
    const Blacklisted = commonVars.validator2;

    beforeEach(async function () {

        this.logicFactory = await PermissionedTokenLogicFactory.new();
        this.proxyFactory = await PermissionedTokenProxyFactory.new();

        // Create a regulator for regulating proxies
        this.regulatorFactory_l = await RegulatorLogicFactory.new();
        this.regulatorFactory_p = await RegulatorProxyFactory.new();
        await this.regulatorFactory_l.createRegulator()
        await this.regulatorFactory_p.createRegulator(await this.regulatorFactory_l.getRegulator(0))
        this.regulator = await this.regulatorFactory_p.getRegulator(0)


    })

    describe('Creating a brand new Regulator logic and proxy from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
            assert.equal(await this.logicFactory.getCount(), 0)
        })
        it('logic creates a new PT', async function () {
            const { logs } = await this.logicFactory.createToken()
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedPermissionedTokenLogic")
            assert.equal(logs[0].args.newToken, await this.logicFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.logicFactory.getCount(), 1)
        })
        it('proxy creates a new regulator', async function () {
            await this.logicFactory.createToken()
            const { logs } = await this.proxyFactory.createToken(await this.logicFactory.getToken(0), this.regulator)
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedPermissionedTokenProxy")
            assert.equal(logs[0].args.newToken, await this.proxyFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    })

    describe('getToken', function () {
        beforeEach(async function () {
            await this.logicFactory.createToken()
            await this.logicFactory.createToken()
            await this.proxyFactory.createToken(await this.logicFactory.getToken(0), this.regulator)
            await this.proxyFactory.createToken(await this.logicFactory.getToken(1), this.regulator)

        })
        it('i is negative, reverts', async function () {
            await expectRevert(this.logicFactory.getToken(-1))
            await expectRevert(this.proxyFactory.getToken(-1))
        })
        it('i is equal to or greater than length, reverts', async function () {
            await expectRevert(this.logicFactory.getToken(2))
            await expectRevert(this.proxyFactory.getToken(2))
            await expectRevert(this.logicFactory.getToken(3))
            await expectRevert(this.proxyFactory.getToken(3))
        })
        it('i >= 0 and < length, retrieves token', async function () {
            assert.equal(await this.logicFactory.getToken(1), await this.logicFactory.tokens(1))
            assert.equal(await this.proxyFactory.getToken(1), await this.proxyFactory.tokens(1))

        })
    })

    describe('Casting children to PermissionedToken and PermissionedTokenProxy', function () {
        const from = validator // Proxy owner
        beforeEach(async function () {
            await this.logicFactory.createToken()
            this.model_0 = PermissionedToken.at(await this.logicFactory.getToken((await this.logicFactory.getCount())-1))
            await this.proxyFactory.createToken(this.model_0.address, this.regulator, {from})
            this.proxy_0 = PermissionedTokenProxy.at(await this.proxyFactory.getToken((await this.proxyFactory.getCount())-1))
            this.token_0 = PermissionedToken.at(this.proxy_0.address)

            this.balances_0 = BalanceSheet.at(await this.token_0.balances())
            this.allowances_0 = AllowanceSheet.at(await this.token_0.allowances())
        })
        it('token and proxy have same address', async function () {
            assert.equal(this.proxy_0.address, this.token_0.address)
        })
        it('initial implementation set by the proxy', async function () {
            assert.equal(await this.proxy_0.implementation(), this.model_0.address)
        })  
        it('proxy is owned by caller of factory createToken()', async function () {
            assert.equal(await this.proxy_0.owner(), validator)
            assert.equal(await this.token_0.owner(), validator)
        }) 
        it('Proxy data stores are owned by token', async function () {
            assert.equal(await this.balances_0.owner(), this.token_0.address)
            assert.equal(await this.allowances_0.owner(), this.token_0.address)
        })
        it('Proxy can change storage and regulator', async function () {
            const newBalances = await BalanceSheet.new()
            const newAllowances = await AllowanceSheet.new()
            await this.regulatorFactory_p.createRegulator(await this.regulatorFactory_l.getRegulator(0))
            const newRegulator = await this.regulatorFactory_p.getRegulator(1)

            await this.token_0.setBalanceStorage(newBalances.address, {from})
            await this.token_0.setAllowanceStorage(newAllowances.address, {from})
            await this.token_0.setRegulator(newRegulator, {from})

            assert.equal(newBalances.address, await this.token_0.balances())
            assert.equal(newAllowances.address, await this.token_0.allowances())
            assert.equal(newRegulator, await this.token_0.regulator())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
                await this.logicFactory.createToken()

                this.model_1 = PermissionedToken.at(await this.logicFactory.getToken((await this.logicFactory.getCount())-1))
    
                const { logs } = await this.proxy_0.upgradeTo(this.model_1.address, {from}) 
                assert.equal(await this.proxy_0.implementation(), this.model_1.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.model_1.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {
            beforeEach(async function () {
                this.reg = Regulator.at(this.regulator)
                const owner = await this.reg.owner()
                await this.reg.addValidator(validator, {from:owner})
                await this.reg.setMinter(minter, {from:validator})
                await this.reg.setWhitelistedUser(whitelisted, {from:validator})

                this.amountToMint = new BigNumber("100000000000000000000") //100e18
                this.amountToBurn = new BigNumber("50000000000000000000") //50e18
            })
            describe('minter calls mint to whitelisted user', function () {
                it('mints', async function () {
                    await this.token_0.mint(whitelisted, this.amountToMint, {from:minter})
                    assertBalance(await this.token_0, whitelisted, this.amountToMint)
                })
            })
            describe('minter calls mint to whitelisted user', function () {
                it('mints', async function () {
                    await this.token_0.mint(whitelisted, this.amountToMint, {from:minter})
                    assertBalance(await this.token_0, whitelisted, this.amountToMint)
                })
            })
            describe('whitelisted user calls burn', function () {
                it('burns', async function () {
                    await this.token_0.mint(whitelisted, this.amountToMint, {from:minter})
                    await this.token_0.burn(this.amountToBurn, {from:whitelisted})
                    assertBalance(await this.token_0, whitelisted, this.amountToMint-this.amountToBurn)
                })
            })
        })
    })

})