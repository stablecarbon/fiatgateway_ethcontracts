const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert } = require('../helpers/common');

const { RegulatorProxyFactory, 
        PermissionSheet,
        BalanceSheet, 
        AllowanceSheet,
        FeeSheet,
        StablecoinWhitelist,
        CarbonDollarProxyFactory,
        CarbonDollarProxy,
        CarbonDollar,
        CarbonDollarRegulator } = require('../helpers/artifacts');

contract('CarbonDollar Factory creating CD proxies', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const whitelisted = commonVars.user3;

    beforeEach(async function () {

        this.proxyFactory = await CarbonDollarProxyFactory.new({from: proxy_owner });
        this.regulatorFactory = await RegulatorProxyFactory.new({from: proxy_owner });

        this.regulator_v0 = await CarbonDollarRegulator.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })
        this.impl_v0 = await CarbonDollar.new(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })

    })

    describe('Creating brand new CarbonDollar proxies from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
        })
        it('proxy creates a new CarbonDollar', async function () {

            // Create a CD regulator first
            await this.regulatorFactory.createRegulatorProxy(this.regulator_v0.address, {from: proxy_owner})
            this.regulatorAddress = await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1)

            // Create a CD proxy using factory
            const { logs } = await this.proxyFactory.createToken(this.impl_v0.address, this.regulatorAddress, {from: proxy_owner})
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedCarbonDollarProxy")
            assert.equal(logs[0].args.newToken, await this.proxyFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    
    })

    describe('getToken', function () {
        beforeEach(async function () {
            // Create a CD regulator first
            await this.regulatorFactory.createRegulatorProxy(this.regulator_v0.address, {from: proxy_owner})
            this.regulatorAddress = await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1)

            // Create a CD proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.regulatorAddress, {from: proxy_owner})

        })
        it('i is negative, reverts', async function () {
            await expectRevert(this.proxyFactory.getToken(-1))
        })
        it('i is equal to or greater than length, reverts', async function () {
            await expectRevert(this.proxyFactory.getToken(1))
            await expectRevert(this.proxyFactory.getToken(2))
        })
        it('i >= 0 and < length, retrieves token', async function () {
            assert.equal(await this.proxyFactory.getToken(0), await this.proxyFactory.tokens(0))

        })
    })

    describe('Casting children to CarbonDollar and CarbonDollarProxy', function () {
        beforeEach(async function () {
            // Create a CD regulator first
            await this.regulatorFactory.createRegulatorProxy(this.regulator_v0.address, {from: proxy_owner})
            this.regulatorAddress = await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1)

            // Create a CD proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.regulatorAddress, {from: proxy_owner})

            this.proxy_0 = CarbonDollarProxy.at(await this.proxyFactory.getToken((await this.proxyFactory.getCount())-1))
            this.token_0 = CarbonDollar.at(this.proxy_0.address)

            this.balances_0 = BalanceSheet.at(await this.token_0.balances())
            this.allowances_0 = AllowanceSheet.at(await this.token_0.allowances())
            this.fees_0 = FeeSheet.at(await this.token_0.stablecoinFees())
            this.whitelist_0 = StablecoinWhitelist.at(await this.token_0.stablecoinWhitelist())
            this.regulator_CD = CarbonDollarRegulator.at(await this.token_0.regulator())
        })
        it('token and proxy have same address', async function () {
            assert.equal(this.proxy_0.address, this.token_0.address)
        })
        it('initial implementation set by the proxy', async function () {
            assert.equal(await this.proxy_0.implementation(), this.impl_v0.address)
        })  
        it('proxy is owned by caller of factory createToken()', async function () {
            assert.equal(await this.proxy_0.owner(), proxy_owner)
            assert.equal(await this.token_0.owner(), proxy_owner)
        }) 
        it('Proxy data stores are owned by token', async function () {
            assert.equal(await this.balances_0.owner(), this.token_0.address)
            assert.equal(await this.allowances_0.owner(), this.token_0.address)
            assert.equal(await this.fees_0.owner(), this.token_0.address)
            assert.equal(await this.whitelist_0.owner(), this.token_0.address)
        })
        it('Proxy can change storage', async function () {
            const newBalances = await BalanceSheet.new()
            const newAllowances = await AllowanceSheet.new()
            const newFees = await FeeSheet.new()
            const newStablecoinWhitelist = await StablecoinWhitelist.new()

            await this.regulatorFactory.createRegulatorProxy(this.regulator_v0.address, {from: proxy_owner})
            const newRegulator = await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1)

            await this.token_0.setBalanceStorage(newBalances.address, {from: proxy_owner})
            await this.token_0.setAllowanceStorage(newAllowances.address, {from: proxy_owner})
            await this.token_0.setFeeSheet(newFees.address, {from: proxy_owner})
            await this.token_0.setStablecoinWhitelist(newStablecoinWhitelist.address, {from: proxy_owner})
            await this.token_0.setRegulator(newRegulator, {from:proxy_owner})

            assert.equal(newBalances.address, await this.token_0.balances())
            assert.equal(newAllowances.address, await this.token_0.allowances())
            assert.equal(newFees.address, await this.token_0.stablecoinFees())
            assert.equal(newStablecoinWhitelist.address, await this.token_0.stablecoinWhitelist())
            assert.equal(newRegulator, await this.token_0.regulator())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
    
                this.impl_v1 = await CarbonDollar.new(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })
                const { logs } = await this.proxy_0.upgradeTo(this.impl_v1.address, {from: proxy_owner}) 
                assert.equal(await this.proxy_0.implementation(), this.impl_v1.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.impl_v1.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {

            describe('owner calls listToken', function () {
                it('adds a token to CD stablecoin whitelist', async function () {
                    await this.token_0.listToken(RANDOM_ADDRESS, {from:proxy_owner})
                    assert(await this.token_0.isWhitelisted(RANDOM_ADDRESS))
                })
            })
            describe('non owner calls listToken', function () {
                it('reverts', async function () {
                    await expectRevert(this.token_0.listToken(RANDOM_ADDRESS, {from: other_owner}))
                })
            })  
            describe('TODO: need to add more unit tests here !', function () {
                
            })
        })
    })
})