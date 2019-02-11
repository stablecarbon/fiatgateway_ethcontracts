// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { 
    MetaToken
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
}

module.exports = {
    tokenSetupMetaToken
}