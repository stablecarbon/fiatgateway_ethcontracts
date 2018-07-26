const { modularTokenTests } = require('../ModularTokenTests');
const { pausableTokenTests } = require('../PausableTokenTests');
const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
const { permissionedTokenStorage } = require('./PermissionedTokenStorage');
const { mutablePermissionedTokenStorage } = require('./MutablePermissionedTokenStorage');
const { PermissionsStorageMock, ValidatorStorageMock } = require('../../helpers/mocks');
const { WhitelistedToken, CarbonDollar, Regulator, AllowanceSheet, BalanceSheet } = require('../../helpers/artifacts');
const { CommonVariables } = require('../../helpers/common');

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
        // Set up regulator data storage contracts and connect to regulator
        this.regulator = await Regulator.new({ from });
        this.permissionsStorage = await PermissionsStorageMock.new({ from });
        this.validatorStorage = await ValidatorStorageMock.new(validator, { from });
        await this.permissionsStorage.transferOwnership(this.regulator.address, { from });
        await this.validatorStorage.transferOwnership(this.regulator.address, { from });
        await this.regulator.setPermissionsStorage(this.permissionsStorage.address, { from });
        await this.regulator.setValidatorStorage(this.validatorStorage.address, { from });

        // Set up user permissions
        await this.regulator.setWhitelistedUser(whitelisted, { from: validator }); // can burn, can transfer
        await this.regulator.setBlacklistedUser(blacklisted, { from: validator }); // can't burn, can't transfer
        await this.regulator.setNonlistedUser(nonlisted, { from: validator }); // can't burn can transfer
        await this.regulator.setMinter(minter, { from: validator }); // can mint

        // Set up WhitelistedToken
        this.wtAllowances = await AllowanceSheet.new({ from });
        this.wtBalances = await BalanceSheet.new({ from });
        this.wtToken = await WhitelistedToken.new(this.wtAllowances.address, this.wtBalances.address, { from });
        await this.wtAllowances.transferOwnership(this.wtToken.address, { from });
        await this.wtBalances.transferOwnership(this.wtToken.address, { from });
        await this.wtToken.setRegulator(this.regulator.address, { from });

        // Set up CarbonDollar
        this.cdAllowances = await AllowanceSheet.new({ from });
        this.cdBalances = await BalanceSheet.new({ from });
        this.cdToken = await CarbonDollar.new(this.cdAllowances.address, this.cdBalances.address, { from });
        this.token = this.cdToken
        await this.cdAllowances.transferOwnership(this.cdToken.address, { from });
        await this.cdBalances.transferOwnership(this.cdToken.address, { from });
        await this.token.setRegulator(this.regulator.address, { from });
    });
    describe("Behaves properly like a mutable permissioned token", function () {
        modularTokenTests(minter, whitelisted, nonlisted);
        permissionedTokenStorage(owner, user);
        mutablePermissionedTokenStorage(owner, user);
        permissionedTokenBehavior(minter, whitelisted, blacklisted, nonlisted, user, validator);
    });
    describe("Carbon Dollar tests", function () {
        carbonDollarTests(owner, minter);
    });
})