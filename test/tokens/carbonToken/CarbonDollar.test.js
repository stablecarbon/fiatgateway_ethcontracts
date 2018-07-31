const { PermissionSheetMock, ValidatorSheetMock } = require('../../helpers/mocks');
const { PermissionedToken, CarbonDollar, Regulator, AllowanceSheet, BalanceSheet, FeeSheet, StablecoinWhitelist } = require('../../helpers/artifacts');
const { CommonVariables } = require('../../helpers/common');
const { carbonDollarStorageInteractions } = require('./carbonTokenBehavior/CarbonTokenStorageBasicInteractions.js');

contract('CarbonDollar', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const minter = commonVars.user
    const validator = commonVars.validator
    const blacklisted = commonVars.attacker
    const whitelisted = commonVars.user2
    const nonlisted = commonVars.user3
    const user = commonVars.validator2

    beforeEach(async function () {
        const from = owner

        // Set up Regulator for PermissionedToken
        this.permissionSheet = await PermissionSheetMock.new( {from:owner })
        this.validatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )
        this.regulator = await Regulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})

        await this.permissionSheet.transferOwnership(this.regulator.address, {from:owner})
        await this.validatorSheet.transferOwnership(this.regulator.address, {from:owner})

        // Set user permissions in regulator
        await this.regulator.setMinter(minter, {from:validator})
        await this.regulator.setWhitelistedUser(whitelisted, {from:validator})
        await this.regulator.setNonlistedUser(nonlisted, {from:validator})
        await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

        // Set up token storage for PermissionedToken
        this.balanceSheet = await BalanceSheet.new({from:owner})
        this.allowanceSheet = await AllowanceSheet.new({from:owner})

        // Make a PermissionedToken for testing CarbonDollar interactions with WhitelistedTokens
        // reuse regulator but make new balances
        this.balanceSheetWT = await BalanceSheet.new({from:owner}) 
        this.allowanceSheetWT = await AllowanceSheet.new({from:owner})
        this.wtToken = await PermissionedToken.new(this.regulator.address, this.balanceSheetWT.address, this.allowanceSheetWT.address, {from:owner})
        await this.balanceSheetWT.transferOwnership(this.wtToken.address, {from:owner})
        await this.allowanceSheetWT.transferOwnership(this.wtToken.address, {from:owner})

        // Set up token storage for CarbonDollar
        this.feeSheet = await FeeSheet.new({from:owner})
        this.stablecoins = await StablecoinWhitelist.new({from:owner})

        this.token = await CarbonDollar.new(this.regulator.address, this.balanceSheet.address, this.allowanceSheet.address, this.feeSheet.address, this.stablecoins.address, {from:owner})

        await this.balanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.allowanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.feeSheet.transferOwnership(this.token.address, {from:owner})
        await this.stablecoins.transferOwnership(this.token.address, {from:owner})

    });

    describe("Carbon Dollar tests", function () {
        carbonDollarStorageInteractions(owner, minter);
    });
})