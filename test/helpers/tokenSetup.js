// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { 
    WhitelistedToken,
    CarbonDollar,
    PermissionedTokenStorage,
    CarbonDollarStorage,
 } = require('./artifacts');
 const { CarbonDollarMock, WhitelistedRegulatorMock } = require('./mocks')

async function tokenSetup(validator, minter, user, owner, whitelisted, blacklisted, nonlisted) {
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

    // CarbonDollar Regulator
    this.regulator_c = await CarbonDollarMock.new({ from: validator })

    // Set user permissions in regulator
    await this.regulator_c.setMinter(minter, { from: validator })
    await this.regulator_c.setMinter(user, { from: validator })
    await this.regulator_c.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_c.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_c.setBlacklistedUser(blacklisted, { from: validator })

    /* ----------------------------------------------------------------------------*/

    // TOKENS

    /* ----------------------------------------------------------------------------*/
    // CarbonDollar
    this.cdToken = await CarbonDollar.new(this.regulator_c.address, { from: owner })

    // WhitelistedToken
    this.wtToken = await WhitelistedToken.new(this.regulator_w.address, this.cdToken.address, { from: owner })

    // must whitelist CUSD address to convert from WT into CUSD (used for minting CUSD)
    await this.regulator_w.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.regulator_c.setWhitelistedUser(this.cdToken.address, { from: validator });

}

module.exports = {
    tokenSetup
}