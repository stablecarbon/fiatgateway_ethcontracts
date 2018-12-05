// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { 
    WhitelistedToken,
    CarbonDollar,
 } = require('./artifacts');
 const { RegulatorMock } = require('./mocks')

async function tokenSetup(validator, minter, owner, blacklisted) {
    const from = owner

    // REGULATORS
    /* ----------------------------------------------------------------------------*/
    this.regulator = await RegulatorMock.new({ from: validator })

    // Set user permissions in regulator
    await this.regulator.setMinter(minter, { from: validator })
    await this.regulator.setBlacklistedUser(blacklisted, { from: validator })

    /* ----------------------------------------------------------------------------*/

    // TOKENS

    /* ----------------------------------------------------------------------------*/
    // CarbonDollar
    this.cdToken = await CarbonDollar.new(this.regulator.address, { from: owner })

    // WhitelistedToken
    this.wtToken = await WhitelistedToken.new(this.regulator.address, this.cdToken.address, { from: owner })

    // Authorize WT0 to be paired with CUSD
    await this.cdToken.listToken(this.wtToken.address, { from: owner });
}

module.exports = {
    tokenSetup
}