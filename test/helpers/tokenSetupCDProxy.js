// beforeEach setup function for CarbonDollarProxyTests 
// Identical to toknSetup except that CD references a proxy address

const { 
    WhitelistedToken,
    CarbonDollar,
    CarbonDollarRegulator,
    PermissionedTokenStorage,
    CarbonDollarStorage,
 } = require('./artifacts');

 const { WhitelistedRegulatorMock } = require('./mocks')

async function tokenSetupCDProxy(CarbonDollarAddress, validator, minter, user, owner, whitelisted, blacklisted, nonlisted) {
    const from = owner

    // REGULATORS
    /* ----------------------------------------------------------------------------*/
    // Whitelisted Regulator
    this.regulator_w = await WhitelistedRegulatorMock.new({ from: validator })

    // Set user permissions in regulator
    await this.regulator_w.setMinter(minter, { from: validator })
    await this.regulator_w.setMinter(user, { from: validator })
    await this.regulator_w.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_w.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_w.setBlacklistedUser(blacklisted, { from: validator })

    /* ----------------------------------------------------------------------------*/

    // TOKENS

    /* ----------------------------------------------------------------------------*/
    
    // CarbonDollar taken from proxy
    this.cdToken = await CarbonDollar.at(CarbonDollarAddress)
    this.regulator_c = await CarbonDollarRegulator.at(await this.cdToken.regulator())
    
    // Set user permissions in CarbonDollar regulator
    // ASSUME that CD data storages and CDRegultor data storages have transferred ownership appropriately
    await this.regulator_c.setMinter(minter, { from: validator })
    await this.regulator_c.setMinter(user, { from: validator })
    await this.regulator_c.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_c.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_c.setBlacklistedUser(blacklisted, { from: validator })

    // WhitelistedToken
    this.wtToken = await WhitelistedToken.new(this.regulator_w.address, this.cdToken.address, { from: owner })

    // must whitelist CUSD address to convert from WT into CUSD (used for minting CUSD)
    await this.regulator_w.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.regulator_c.setWhitelistedUser(this.cdToken.address, { from: validator });
}

module.exports = {
    tokenSetupCDProxy
}