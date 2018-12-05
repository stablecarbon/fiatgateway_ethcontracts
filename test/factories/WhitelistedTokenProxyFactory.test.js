const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../helpers/common');

const { RegulatorProxyFactory, 
        CarbonDollar,
        CarbonDollarProxyFactory,
        CarbonDollarRegulator,
        WhitelistedTokenProxyFactory,
        WhitelistedTokenProxy,
        WhitelistedToken,
        Regulator } = require('../helpers/artifacts');
const { RegulatorMock } = require('../helpers/mocks')

contract('WhitelistedToken Factory creating WT proxies', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const user = commonVars.user3;

    beforeEach(async function () {

        this.proxyFactory = await WhitelistedTokenProxyFactory.new({ from: proxy_owner });

        this.regulator_WT = await RegulatorMock.new({from: validator })
        this.impl_v0 = await WhitelistedToken.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })

        // Create a CD Token necessary to create a WT token
        this.cdTokenModel = await CarbonDollar.new(ZERO_ADDRESS, {from: other_owner })
        this.cdProxyFactory = await CarbonDollarProxyFactory.new({from: proxy_owner });
        this.regulator_CD = await RegulatorMock.new({from: validator})
        await this.cdProxyFactory.createToken(this.cdTokenModel.address, this.regulator_CD.address, { from: proxy_owner })
        this.cdTokenAddress = await this.cdProxyFactory.getToken((await this.cdProxyFactory.getCount())-1)

    })

    describe('Creating brand new WhitelistedToken proxies from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
        })
        it('proxy creates a new WhitelistedToken', async function () {

            // Create a WT proxy using factory
            const { logs } = await this.proxyFactory.createToken(this.impl_v0.address, this.cdTokenAddress, this.regulator_WT.address, {from: proxy_owner})
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedWhitelistedTokenProxy")
            assert.equal(logs[0].args.newToken, await this.proxyFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    
    })

    describe('getToken', function () {
        beforeEach(async function () {
            // Create a WT proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.cdTokenAddress, this.regulator_WT.address, {from: proxy_owner})

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

    describe('Casting children to WhitelistedToken and WhitelistedTokenProxy', function () {
        beforeEach(async function () {

            // Create a WT proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.cdTokenAddress, this.regulator_WT.address, {from: proxy_owner})

            this.proxy_0 = WhitelistedTokenProxy.at(await this.proxyFactory.getToken((await this.proxyFactory.getCount())-1))
            this.token_0 = WhitelistedToken.at(this.proxy_0.address)

            // Claim ownership of WT token
            await this.token_0.claimOwnership({ from: proxy_owner })

            this.cusd_0 = CarbonDollar.at(await this.token_0.cusdAddress())
            this.regulator_WT = Regulator.at(await this.token_0.regulator())
            
            await this.cusd_0.claimOwnership({ from: proxy_owner})
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
            const newCD = await CarbonDollar.new(ZERO_ADDRESS, {from:other_owner})
            const newRegulator = await Regulator.new({ from:validator})

            await this.token_0.setCUSDAddress(newCD.address, {from: proxy_owner})
            await this.token_0.setRegulator(newRegulator.address, {from:proxy_owner})

            assert.equal(newCD.address, await this.token_0.cusdAddress())
            assert.equal(newRegulator.address, await this.token_0.regulator())
        })
        describe("Proxy upgradeTo and implentation", function () {
            it('upgrades to next implementation', async function () {
                this.impl_v1 = await WhitelistedToken.new(ZERO_ADDRESS, ZERO_ADDRESS, {from: other_owner })
                const { logs } = await this.proxy_0.upgradeTo(this.impl_v1.address, {from: proxy_owner}) 
                assert.equal(await this.proxy_0.implementation(), this.impl_v1.address) 
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "Upgraded")
                assert.equal(logs[0].args.implementation, this.impl_v1.address)        
            })
        })

        describe('Proxy delegates calls to implementation', function () {

            beforeEach(async function () {
                // Set up CD permissions
                await this.cusd_0.listToken(this.token_0.address, {from:proxy_owner})

                // Set up WT permissions
                await this.regulator_WT.setMinter(minter, {from:validator})
            })
            describe('mintCUSD', function () {
                // Permissions: CD must whitelist WT token, whitelist the mintCUSD() caller, and WT must whitelist the CD address
                it('minter calls', async function () {
                    await this.token_0.mintCUSD(user, 10 * 10 ** 18, {from:minter})
                    await assertBalance(this.token_0, this.cusd_0.address, 10 * 10 ** 18)
                    await assertBalance(this.cusd_0, user, 10 * 10 ** 18)
                })
            })
            describe('convertWT', function () {

                it('should convert whitelisted CUSD into WT', async function () {
                    // Mint user some WT tokens for testing purposes
                    await this.token_0.mint(user, 10 * 10 ** 18, {from:minter})

                    await assertBalance(this.token_0, user, 10 * 10 ** 18)
                    await assertBalance(this.cusd_0, user, 0)
                    await assertBalance(this.token_0, this.cusd_0.address, 0)

                    await this.token_0.convertWT( 5 * 10 ** 18, {from:user})

                    await assertBalance(this.token_0, user, 5 * 10 ** 18)
                    await assertBalance(this.cusd_0, user, 5 * 10 ** 18)
                    await assertBalance(this.token_0, this.cusd_0.address, 5 * 10 ** 18)
                })

            })
        })
    })
})