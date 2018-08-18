const { ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert, assertBalance } = require('./helpers/common');

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
        WhitelistedTokenRegulator } = require('./helpers/artifacts');

contract('Deployment scripts', _accounts => {
    const owner = _accounts[0]; 
    // accounts[0] should be owner of all contracts AND the initial validator, but must first claim the contracts!!!

    it('Testing that deployments succeeded with proper setup', async function () {
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

        // Claim ownerships
        await this.cdRegulator.claimOwnership({ from: owner })
        await this.wtRegulator.claimOwnership({ from: owner })
        await this.cdToken.claimOwnership({ from: owner })
        await this.wtToken.claimOwnership({ from: owner })

        assert.equal(this.regCount, 2); // Should have deployed one WT and one CD regulator
        console.log("Deployed two regulators")
        assert.equal(this.cdCount, 1)
        console.log("Deployed one CarbonDollar")
        assert.equal(this.wtCount, 1)
        console.log("Deployed on WhitelistedToken")
        
        assert.equal(await this.wtToken.owner(), owner)
        assert.equal(await this.cdToken.owner(), owner)
        assert.equal(await this.wtRegulator.owner(), owner)
        assert.equal(await this.cdRegulator.owner(), owner)
        console.log("Owners set properly")
        
        assert(await this.wtRegulator.isValidator(owner))
        assert(await this.cdRegulator.isValidator(owner))
        console.log("Owner is an initial validator on both regulators")

        assert(await this.wtRegulator.isWhitelistedUser(this.cdToken.address))
        assert(await this.cdRegulator.isWhitelistedUser(this.cdToken.address))
        console.log("Carbondollar address is whitelisted by both regulators")

        assert(await this.cdToken.isWhitelisted(this.wtToken.address))
        console.log("WhitelistedToken address is whitelisted by CarbonDollar as a stablecoin")

    })



})
