// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { 
    CarbonDollarRegulator, 
    WhitelistedTokenRegulator,
    WhitelistedToken,
    CarbonDollar,
    AllowanceSheet,
    BalanceSheet,
    FeeSheet,
    StablecoinWhitelist } = require('./artifacts');

const { PermissionSheetMock, ValidatorSheetMock} = require("./mocks");

async function tokenSetupProxy(WhitelistedTokenAddress, CarbonDollarAddress, validator, minter, user, owner, whitelisted, blacklisted, nonlisted) {
    const from = owner

    // REGULATORS

    /* ----------------------------------------------------------------------------*/

    // TOKENS

    /* ----------------------------------------------------------------------------*/
    
    // CarbonDollar
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
    this.wtToken = await WhitelistedToken.at(WhitelistedTokenAddress)
    this.regulator_w = await WhitelistedToken.at(await this.wtToken.regulator())

    // Set user permissions in regulator
    // ASSUME that CD data storages and CDRegultor data storages have transferred ownership appropriately
    await this.regulator_w.setMinter(minter, { from: validator })
    await this.regulator_w.setMinter(user, { from: validator })
    await this.regulator_w.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_w.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_w.setBlacklistedUser(blacklisted, { from: validator })


    // must whitelist CUSD address to convert from WT into CUSD (used for minting CUSD)
    await this.regulator_w.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.regulator_c.setWhitelistedUser(this.cdToken.address, { from: validator });
}

module.exports = {
    tokenSetupProxy
}