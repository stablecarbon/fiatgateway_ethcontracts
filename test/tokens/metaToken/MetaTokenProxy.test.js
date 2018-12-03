const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common');

const { 
        CarbonDollarProxyFactory,
        CarbonDollarProxy,
        MetaToken,
        Regulator,
        WhitelistedToken,
        WhitelistedTokenProxyFactory } = require('../../helpers/artifacts');
const { RegulatorMock } = require('../../helpers/mocks')

contract('CarbonDollar Factory creating CD proxies based on MetaToken logic', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const user = commonVars.user3;

    beforeEach(async function () {
        this.proxyFactory = await CarbonDollarProxyFactory.new({from: proxy_owner });
        this.regulator_CD = await RegulatorMock.new({from: validator })
        this.impl_v0 = await MetaToken.new(ZERO_ADDRESS, {from: other_owner })
    })

    describe('Creating brand new CarbonDollar proxies from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
        })
        it('proxy creates a new CarbonDollarProxy based on MetaToken', async function () {

            // Create a CD proxy using factory
            const { logs } = await this.proxyFactory.createToken(this.impl_v0.address, this.regulator_CD.address, {from: proxy_owner})
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedCarbonDollarProxy")
            assert.equal(logs[0].args.newToken, await this.proxyFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    })

    describe('Casting children to MetaToken and CarbonDollarProxy', function () {
        beforeEach(async function () {

            // Create a CD proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.regulator_CD.address, {from: proxy_owner})

            this.proxy_0 = CarbonDollarProxy.at(await this.proxyFactory.getToken((await this.proxyFactory.getCount())-1))
            this.token_0 = MetaToken.at(this.proxy_0.address)

            // Claim ownership of newly created proxy   
            await this.token_0.claimOwnership({ from:proxy_owner})
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
        it('Proxy can change storage', async function () {

            const newRegulator = (await RegulatorMock.new({from: validator})).address

            await this.token_0.setRegulator(newRegulator, {from:proxy_owner})

            assert.equal(newRegulator, await this.token_0.regulator())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
    
                this.impl_v1 = await MetaToken.new(ZERO_ADDRESS, {from: other_owner })
                const { logs } = await this.proxy_0.upgradeTo(this.impl_v1.address, {from: proxy_owner}) 
                assert.equal(await this.proxy_0.implementation(), this.impl_v1.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.impl_v1.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {

            beforeEach(async function () {
                // Create a WT regulator
                this.regulator_WT = await RegulatorMock.new({from: validator})

                // Create a WT token
                this.token_WT_model = await WhitelistedToken.new(ZERO_ADDRESS, ZERO_ADDRESS, {from:other_owner})
                this.wtProxyFactory = await WhitelistedTokenProxyFactory.new({ from: proxy_owner })
                await this.wtProxyFactory.createToken(this.token_WT_model.address, this.token_0.address, this.regulator_WT.address, {from:proxy_owner})
                this.token_WT = WhitelistedToken.at(await this.wtProxyFactory.getToken((await this.wtProxyFactory.getCount())-1))
                this.regulator_WT = Regulator.at(await this.token_WT.regulator())

                await this.token_WT.claimOwnership({ from:proxy_owner })

            })
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
            describe('burnCarbonDollar and convertCarbonDollar', function () {
                beforeEach(async function () {
                    await this.token_0.listToken(this.token_WT.address, {from:proxy_owner})

                    // Set up WT permissions
                    await this.regulator_WT.setMinter(minter, {from:validator})
                })
                it('no fee, burns carbon dollar', async function () {
                    await this.token_WT.mintCUSD(user, 10 * 10 ** 18, {from: minter})
                    await assertBalance(this.token_0, user, 10 * 10 ** 18)
                    await assertBalance(this.token_WT, user, 0)
                    await assertBalance(this.token_WT, this.token_0.address, 10 * 10 ** 18)
                    
                    await this.token_0.burnCarbonDollar(this.token_WT.address, 5 * 10 ** 18, {from:user})
                    await assertBalance(this.token_0, user, 5 * 10 ** 18)
                    await assertBalance(this.token_WT, user, 0)
                    await assertBalance(this.token_WT, this.token_0.address, 5 * 10 ** 18)
                })
                it('no fee, converts carbon dollar', async function () {
                    await this.token_WT.mintCUSD(user, 10 * 10 ** 18, {from: minter})
                    await assertBalance(this.token_0, user, 10 * 10 ** 18)
                    await assertBalance(this.token_WT, user, 0)
                    await assertBalance(this.token_WT, this.token_0.address, 10 * 10 ** 18)
                    
                    await this.token_0.convertCarbonDollar(this.token_WT.address, 5 * 10 ** 18, {from:user})
                    await assertBalance(this.token_0, user, 5 * 10 ** 18)
                    await assertBalance(this.token_WT, user, 5 * 10 ** 18)
                    await assertBalance(this.token_WT, this.token_0.address, 5 * 10 ** 18)
                })
            })
        })
    })
})