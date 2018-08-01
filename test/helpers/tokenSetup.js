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

async function tokenSetup(validator, minter, user, owner, whitelisted, blacklisted, nonlisted) {
    const from = owner

    // REGULATORS
    /* ----------------------------------------------------------------------------*/
    // Whitelisted Regulator
    this.permissionSheet_w = await PermissionSheetMock.new({ from: owner })
    this.validatorSheet_w = await ValidatorSheetMock.new(validator, { from: owner })
    this.regulator_w = await WhitelistedTokenRegulator.new(this.permissionSheet_w.address, this.validatorSheet_w.address, { from: owner })

    await this.permissionSheet_w.transferOwnership(this.regulator_w.address, { from: owner })
    await this.validatorSheet_w.transferOwnership(this.regulator_w.address, { from: owner })

    // Set user permissions in regulator
    await this.regulator_w.setMinter(minter, { from: validator })
    await this.regulator_w.setMinter(user, { from: validator })
    await this.regulator_w.setWhitelistedUser(whitelisted, { from: validator })
    await this.regulator_w.setNonlistedUser(nonlisted, { from: validator })
    await this.regulator_w.setBlacklistedUser(blacklisted, { from: validator })

    // CarbonDollar Regulator
    this.permissionSheet_c = await PermissionSheetMock.new({ from: owner })
    this.validatorSheet_c = await ValidatorSheetMock.new(validator, { from: owner })
    this.regulator_c = await CarbonDollarRegulator.new(this.permissionSheet_c.address, this.validatorSheet_c.address, { from: owner })

    await this.permissionSheet_c.transferOwnership(this.regulator_c.address, { from: owner })
    await this.validatorSheet_c.transferOwnership(this.regulator_c.address, { from: owner })

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

    this.cdToken = await CarbonDollar.new(this.regulator_c.address, this.balanceSheet.address, this.allowanceSheet.address, this.feeSheet.address, this.stablecoins.address, { from: owner })

    await this.balanceSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.allowanceSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.feeSheet.transferOwnership(this.cdToken.address, { from: owner })
    await this.stablecoins.transferOwnership(this.cdToken.address, { from: owner })

    // WhitelistedToken
    this.balanceSheetWT = await BalanceSheet.new({ from: owner })
    this.allowanceSheetWT = await AllowanceSheet.new({ from: owner })
    this.wtToken = await WhitelistedToken.new(this.regulator_w.address, this.balanceSheetWT.address, this.allowanceSheetWT.address, this.cdToken.address, { from: owner })
    await this.balanceSheetWT.transferOwnership(this.wtToken.address, { from: owner })
    await this.allowanceSheetWT.transferOwnership(this.wtToken.address, { from: owner })

    // must whitelist CUSD address to convert from WT into CUSD (used for minting CUSD)
    await this.regulator_w.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.regulator_c.setWhitelistedUser(this.cdToken.address, { from: validator });
}

module.exports = {
    tokenSetup
}