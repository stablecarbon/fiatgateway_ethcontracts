// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { 
    MetaToken,
    WhitelistedToken
 } = require('./artifacts');
 const { RegulatorMock } = require('./mocks')

async function tokenSetupMetaToken(validator, minter, owner, blacklisted) {
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
    // MetaToken can be a CUSD implementation
    this.metatoken = await MetaToken.new(this.regulator.address, { from: owner })

    // WhitelistedToken
    this.wtToken = await WhitelistedToken.new(this.regulator.address, this.metatoken.address, { from: owner })

    // Authorize WT0 to be paired with MetaToken
    await this.metatoken.listToken(this.wtToken.address, { from: owner });

    // Set a 0.1% fee
    await this.metatoken.setFee(this.wtToken.address, 1, { from: owner }) 
}

module.exports = {
    tokenSetupMetaToken
}