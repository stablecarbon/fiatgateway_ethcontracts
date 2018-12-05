// beforeEach setup function for CarbonDollarProxyTests 
// Identical to toknSetup except that CD references a proxy address

const { 
    WhitelistedToken,
    CarbonDollar,
 } = require('./artifacts');

 const { RegulatorMock } = require('./mocks')

async function tokenSetupCDProxy(CarbonDollarAddress, validator, minter, owner, blacklisted) {
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
    
    // CarbonDollar taken from proxy
    this.cdToken = await CarbonDollar.at(CarbonDollarAddress)
    
    // WhitelistedToken
    this.wtToken = await WhitelistedToken.new(this.regulator.address, this.cdToken.address, { from: owner })

    // Authorize WT0 to be paired with CUSD
    await this.cdToken.listToken(this.wtToken.address, { from: owner });

}

module.exports = {
    tokenSetupCDProxy
}