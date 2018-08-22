// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const {
    CarbonDollarRegulator,
    WhitelistedTokenRegulator,
    WhitelistedToken,
    CarbonDollar,
    CarbonDollarProxy,
    AllowanceSheet,
    BalanceSheet,
    FeeSheet,
    StablecoinWhitelist } = require('./artifacts');

const { PermissionSheetMock, ValidatorSheetMock} = require("./mocks");

async function tokenSetupWLProxy(validator, minter, user, owner, whitelisted, blacklisted, nonlisted) {
    const from = owner

    // REGULATORS
    /* ----------------------------------------------------------------------------*/
    // Whitelisted Regulator
    this.permissionSheet_w = await PermissionSheetMock.new({ from: owner })
    this.validatorSheet_w = await ValidatorSheetMock.new(validator, { from: owner })
    this.regulator_w = await WhitelistedTokenRegulator.new(this.permissionSheet_w.address, this.validatorSheet_w.address, { from: owner })

    await this.permissionSheet_w.transferOwnership(this.regulator_w.address, { from: owner })
    await this.validatorSheet_w.transferOwnership(this.regulator_w.address, { from: owner })
    await this.regulator_w.claimPermissionOwnership()
    await this.regulator_w.claimValidatorOwnership()

    // CarbonDollar Regulator
    this.permissionSheet_c = await PermissionSheetMock.new({ from: owner })
    this.validatorSheet_c = await ValidatorSheetMock.new(validator, { from: owner })
    this.regulator_c = await CarbonDollarRegulator.new(this.permissionSheet_c.address, this.validatorSheet_c.address, { from: owner })

    await this.permissionSheet_c.transferOwnership(this.regulator_c.address, { from: owner })
    await this.validatorSheet_c.transferOwnership(this.regulator_c.address, { from: owner })
    await this.regulator_c.claimPermissionOwnership()
    await this.regulator_c.claimValidatorOwnership()

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
    this.balanceSheet = await BalanceSheet.new({ from: owner })
    this.allowanceSheet = await AllowanceSheet.new({ from: owner })
    this.feeSheet = await FeeSheet.new({ from: owner })
    this.stablecoins = await StablecoinWhitelist.new({ from: owner })

    this.cdToken = await CarbonDollar.new(this.regulator_c.address,
                                          this.balanceSheet.address,
                                          this.allowanceSheet.address,
                                          this.feeSheet.address,
                                          this.stablecoins.address, { from: owner })

    await this.balanceSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.allowanceSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.feeSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.stablecoins.transferOwnership(this.cdToken.address, { from: owner })
    await this.cdToken.claimBalanceOwnership()
    await this.cdToken.claimAllowanceOwnership()
    await this.cdToken.claimFeeOwnership()
    await this.cdToken.claimWhitelistOwnership()

    // WhitelistedToken
    this.wtToken = await WhitelistedToken.at(WhitelistedTokenAddress)
    this.regulator_w = await WhitelistedTokenRegulator.at(await this.wtToken.regulator())

    // Set user permissions in regulator
    await this.regulator_w.setMinter(minter, { from: validator })
    await this.regulator_w.setMinter(user, { from: validator })
    await this.regulator_w.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_w.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_w.setBlacklistedUser(blacklisted, { from: validator })


    // must whitelist CUSD address to convert from WT into CUSD (used for minting CUSD)
    await this.regulator_w.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.regulator_c.setWhitelistedUser(this.cdToken.address, { from: validator });

    // Carbon Dollar Proxy
    this.proxyCUSD = await CarbonDollarProxy.new({from:owner})

    // Whitelisted Token Proxy
    this.proxyWL = await WhitelistedtokenProxy.new(this.wtToken.address,
         this.regulator_w.address, this.balanceSheetWT.address,
          this.allowanceSheetWT.address, this.proxyCUSD, { from:proxyOwner})


}

module.exports = {
    tokenSetupWLProxy
}
