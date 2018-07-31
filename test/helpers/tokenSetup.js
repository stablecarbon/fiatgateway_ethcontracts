// beforeEach setup function for CarbonDollarTests and WhitelistedToken tests.

const { CarbonDollarRegulatorMock, WhitelistedTokenRegulatorMock } = require('./mocks');
const { 
    PermissionSheet,
    ValidatorSheet,
    WhitelistedToken,
    CarbonDollar,
    AllowanceSheet,
    BalanceSheet,
    FeeSheet,
    StablecoinWhitelist } = require('./artifacts');

async function tokenSetup(validator, minter, owner, whitelisted, blacklisted, nonlisted) {
    const from = owner
    // Set up CarbonDollar regulator data storage contracts and connect to regulator
    this.cdPermissionsStorage = await PermissionSheet.new({ from });
    this.cdValidatorStorage = await ValidatorSheet.new(validator, { from });
    this.cdRegulator = await CarbonDollarRegulatorMock.new(this.cdPermissionsStorage.address, 
                                                           this.cdValidatorStorage.address,
                                                           validator, { from });
    
    await this.cdPermissionsStorage.transferOwnership(this.cdRegulator.address, { from });
    await this.cdValidatorStorage.transferOwnership(this.cdRegulator.address, { from });

    // Set up user permissions
    await this.cdRegulator.setWhitelistedUser(whitelisted, { from: validator }); // can burn, can transfer
    await this.cdRegulator.setBlacklistedUser(blacklisted, { from: validator }); // can't burn, can't transfer
    await this.cdRegulator.setNonlistedUser(nonlisted, { from: validator }); // can't burn can transfer
    await this.cdRegulator.setMinter(minter, { from: validator }); // can mint

    // Set up CarbonDollar
    this.cdAllowances = await AllowanceSheet.new({ from });
    this.cdBalances = await BalanceSheet.new({ from });
    this.cdFeeSheet = await FeeSheet.new({ from });
    this.cdStablecoinWhitelist = await StablecoinWhitelist.new({ from });
    this.cdToken = await CarbonDollar.new(
        this.cdRegulator.address,
        this.cdBalances.address,
        this.cdAllowances.address,
        this.cdFeeSheet.address,
        this.cdStablecoinWhitelist.address,
        { from });
    await this.cdAllowances.transferOwnership(this.cdToken.address, { from });
    await this.cdBalances.transferOwnership(this.cdToken.address, { from });
    await this.cdFeeSheet.transferOwnership(this.cdToken.address, { from });
    await this.cdStablecoinWhitelist.transferOwnership(this.cdToken.address, { from });

    // Set up WT regulator data storage contracts and connect to regulator
    
    this.wtPermissionsStorage = await PermissionSheet.new({ from });
    this.wtValidatorStorage = await ValidatorSheet.new(validator, { from });
    this.wtRegulator = await WhitelistedTokenRegulatorMock.new(this.wtPermissionsStorage.address,
                                                               this.wtValidatorStorage.address,
                                                               validator, { from });
    await this.wtPermissionsStorage.transferOwnership(this.wtRegulator.address, { from });
    await this.wtValidatorStorage.transferOwnership(this.wtRegulator.address, { from });

    // Set up user permissions
    await this.wtRegulator.setMinter(minter, { from: validator }); // can mint
    await this.wtRegulator.setWhitelistedUser(whitelisted, { from: validator }); // can burn, can transfer
    await this.wtRegulator.setWhitelistedUser(this.cdToken.address, { from: validator });
    await this.wtRegulator.setBlacklistedUser(blacklisted, { from: validator }); // can't burn, can't transfer
    await this.wtRegulator.setNonlistedUser(nonlisted, { from: validator }); // can't burn can transfer

    // Set up WhitelistedToken
    this.wtAllowances = await AllowanceSheet.new({ from });
    this.wtBalances = await BalanceSheet.new({ from });
    this.wtToken = await WhitelistedToken.new(
        this.wtRegulator.address,
        this.wtAllowances.address,
        this.wtBalances.address,
        this.cdToken.address,
        { from });
    this.cdToken.listToken(this.wtToken.address, { from });
    await this.wtAllowances.transferOwnership(this.wtToken.address, { from });
    await this.wtBalances.transferOwnership(this.wtToken.address, { from });
}

module.exports = {
    tokenSetup
}