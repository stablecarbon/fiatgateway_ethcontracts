const { ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('../helpers/common');

const { RegulatorProxyFactory, 
        PermissionSheet,
        BalanceSheet, 
        AllowanceSheet,
        FeeSheet,
        StablecoinWhitelist,
        CarbonDollar,
        CarbonDollarProxyFactory,
        CarbonDollarRegulator,
        WhitelistedTokenProxyFactory,
        WhitelistedTokenProxy,
        WhitelistedToken,
        WhitelistedTokenRegulator } = require('../helpers/artifacts');

contract('Deployment scripts', _accounts => {
    const owner = _accounts[0]; 
    // accounts[0] should be owner of all contracts AND the initial validator, but must first claim the contracts!!!

    beforeEach(async function () {
        // Regulator factories 
        this.regFactory = await RegulatorProxyFactory.deployed()
        this.regCount = await this.regFactory.getCount()

        // Token factorties
        this.cdFactory = await CarbonDollarProxyFactory.deployed()
        this.wtFactory = await WhitelistedTokenProxyFactory.deployed()
        this.cdCount = await this.cdFactory.getCount()
        this.wtCount = await this.wtFactory.getCount()

        this.cdRegulator = CarbonDollarRegulator.at(await this.regFactory.getRegulatorProxy(this.regCount-2))
        this.wtRegulator = WhitelistedTokenRegulator.at(await this.regFactory.getRegulatorProxy(this.regCount-1))
        this.cdToken = CarbonDollar.at(await this.cdFactory.getToken(this.cdCount-1))
        this.wtToken = WhitelistedToken.at(await this.wtFactory.getToken(this.wtCount-1))

    })
    it('factories created the minimum set of contracts', async function () {
        assert.equal(this.regCount, 2); // Should have deployed one WT and one CD regulator
        assert.equal(this.cdCount, 1)
        assert.equal(this.wtCount, 1) 
    })
    it('regulators initialized caller of factory creation methods as validator', async function () {
        assert(await this.wtRegulator.isValidator(owner))
        assert(await this.cdRegulator.isValidator(owner))
    })
    it('factory creation caller owns contracts', async function () {
        assert.equal(await this.wtRegulator.owner(), owner)
        assert.equal(await this.cdRegulator.owner(), owner)
        assert.equal(await this.cdToken.owner(), owner)
        assert.equal(await this.wtToken.owner(), owner)
    })
    it('CUSD address is whitelisted by both regulators', async function () {
        assert(await this.wtRegulator.isWhitelistedUser(this.cdToken.address))
        assert(await this.cdRegulator.isWhitelistedUser(this.cdToken.address))
    })
    it('CUSD contract whitelisted WT token address', async function () {
        assert(await this.cdToken.isWhitelisted(this.wtToken.address))
    })
    it('initial validator is a minter on both regulators', async function () {
        assert(await this.wtRegulator.isMinter(owner))
        assert(await this.cdRegulator.isMinter(owner))
    })
})