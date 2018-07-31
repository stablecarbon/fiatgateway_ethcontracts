const { PermissionSheetMock, ValidatorSheetMock } = require('../../helpers/mocks');
const { WhitelistedToken, PermissionedToken, CarbonDollar, Regulator, WhitelistedTokenRegulator, CarbonDollarRegulator, AllowanceSheet, BalanceSheet, FeeSheet, StablecoinWhitelist } = require('../../helpers/artifacts');
const { CommonVariables } = require('../../helpers/common');
const { carbonDollarStorageInteractionTests } = require('./carbonTokenBehavior/CarbonTokenStorageBasicInteractions.js');
const { carbonDollarBehaviorTests } = require('./carbonTokenBehavior/CarbonTokenBehavior.js')

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

        // REGULATORS
        /* ----------------------------------------------------------------------------*/
        // Whitelisted Regulator
        this.permissionSheet_w = await PermissionSheetMock.new( {from:owner })
        this.validatorSheet_w = await ValidatorSheetMock.new(validator, {from:owner} )
        this.regulator_w = await WhitelistedTokenRegulator.new(this.permissionSheet_w.address, this.validatorSheet_w.address, {from:owner})

        await this.permissionSheet_w.transferOwnership(this.regulator_w.address, {from:owner})
        await this.validatorSheet_w.transferOwnership(this.regulator_w.address, {from:owner})

        // Set user permissions in regulator
        await this.regulator_w.setMinter(minter, {from:validator})
        await this.regulator_w.setMinter(user, {from:validator})
        await this.regulator_w.setWhitelistedUser(whitelisted, {from:validator})
        await this.regulator_w.setNonlistedUser(nonlisted, {from:validator})
        await this.regulator_w.setBlacklistedUser(blacklisted, {from:validator})

        // CarbonDollar Regulator
        this.permissionSheet_c = await PermissionSheetMock.new( {from:owner })
        this.validatorSheet_c = await ValidatorSheetMock.new(validator, {from:owner} )
        this.regulator_c = await WhitelistedTokenRegulator.new(this.permissionSheet_c.address, this.validatorSheet_c.address, {from:owner})

        await this.permissionSheet_c.transferOwnership(this.regulator_c.address, {from:owner})
        await this.validatorSheet_c.transferOwnership(this.regulator_c.address, {from:owner})

        // Set user permissions in regulator
        await this.regulator_c.setMinter(minter, {from:validator})
        await this.regulator_c.setMinter(user, {from:validator})
        await this.regulator_c.setWhitelistedUser(whitelisted, {from:validator})
        await this.regulator_c.setNonlistedUser(nonlisted, {from:validator})
        await this.regulator_c.setBlacklistedUser(blacklisted, {from:validator})

        /* ----------------------------------------------------------------------------*/

        // TOKENS

        /* ----------------------------------------------------------------------------*/
        // CarbonDollar
        this.balanceSheet = await BalanceSheet.new({from:owner})
        this.allowanceSheet = await AllowanceSheet.new({from:owner})
        this.feeSheet = await FeeSheet.new({from:owner})
        this.stablecoins = await StablecoinWhitelist.new({from:owner})

        this.token = await CarbonDollar.new(this.regulator_c.address, this.balanceSheet.address, this.allowanceSheet.address, this.feeSheet.address, this.stablecoins.address, {from:owner})

        await this.balanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.allowanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.feeSheet.transferOwnership(this.token.address, {from:owner})
        await this.stablecoins.transferOwnership(this.token.address, {from:owner})

        // WhitelistedToken
        this.balanceSheetWT = await BalanceSheet.new({from:owner}) 
        this.allowanceSheetWT = await AllowanceSheet.new({from:owner})
        this.wtToken = await WhitelistedToken.new(this.regulator_w.address, this.balanceSheetWT.address, this.allowanceSheetWT.address, this.token.address, {from:owner})
        await this.balanceSheetWT.transferOwnership(this.wtToken.address, {from:owner})
        await this.allowanceSheetWT.transferOwnership(this.wtToken.address, {from:owner})
        await this.regulator_w.setWhitelistedUser(this.token.address, { from: validator }); // must whitelist CUSD address



    });

    describe("Carbon Dollar tests", function () {
        // carbonDollarStorageInteractionTests(owner, minter);
        carbonDollarBehaviorTests(owner, user, whitelisted, minter);
    });
})