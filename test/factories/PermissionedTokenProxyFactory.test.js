const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../helpers/common');

const { RegulatorProxyFactory, 
        PermissionedTokenProxyFactory,
        PermissionedTokenProxy,
        MetaToken,
        Regulator } = require('../helpers/artifacts');
const { RegulatorMock } = require('../helpers/mocks')

contract('PermissionedToken Factory creating PT proxies based on MetaToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const proxy_owner = commonVars.owner;
    const other_owner = commonVars.user;
    const validator = commonVars.validator;
    const minter = commonVars.user2;
    const user = commonVars.user3;

    beforeEach(async function () {
        this.proxyFactory = await PermissionedTokenProxyFactory.new({from: proxy_owner });
        this.regulator_CD = await RegulatorMock.new({from: validator })
        this.impl_v0 = await MetaToken.new(ZERO_ADDRESS, {from: other_owner })
    })

    describe('Creating brand new PermissionedToken proxies from the factory', function () {

        it('initiates the factories', async function () {
            assert.equal(await this.proxyFactory.getCount(), 0)
        })
        it('proxy creates a new PermissionedToken', async function () {
            const { logs } = await this.proxyFactory.createToken(this.impl_v0.address, this.regulator_CD.address, {from: proxy_owner})
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, "CreatedPermissionedTokenProxy")
            assert.equal(logs[0].args.newToken, await this.proxyFactory.getToken(0))
            assert.equal(logs[0].args.index, 0)
            assert.equal(await this.proxyFactory.getCount(), 1)
        })
    
    })

    describe('getToken', function () {
        beforeEach(async function () {
            // Create a CD proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.regulator_CD.address, {from: proxy_owner})
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

    describe('Casting children to MetaToken and PermissionedTokenProxy', function () {
        beforeEach(async function () {

            // Create a CD proxy using factory
            await this.proxyFactory.createToken(this.impl_v0.address, this.regulator_CD.address, {from: proxy_owner})

            this.proxy_0 = PermissionedTokenProxy.at(await this.proxyFactory.getToken((await this.proxyFactory.getCount())-1))
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
            describe('burn', function () {
                beforeEach(async function () {
                    // Set up PT permissions
                    await this.regulator_CD.setMinter(minter, {from:validator})
                })
                it('burns CUSD', async function () {
                    await this.token_0.mint(user, 10 * 10 ** 18, {from: minter})
                    await assertBalance(this.token_0, user, 10 * 10 ** 18)
                    
                    await this.token_0.burn(5 * 10 ** 18, {from:user})
                    await assertBalance(this.token_0, user, 5 * 10 ** 18)
                })
            })
        })
    })
})