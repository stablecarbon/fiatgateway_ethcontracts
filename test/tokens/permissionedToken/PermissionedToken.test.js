const { modularTokenTests } = require('../ModularTokenTests');
const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
const { permissionedTokenStorage } = require('./PermissionedTokenStorage');
const { PermissionsStorageMock, ValidatorStorageMock } = require('../../helpers/mocks');
const { PermissionedToken, Regulator, AllowanceSheet, BalanceSheet } = require('../../helpers/artifacts');

const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');

contract('PermissionedToken', _accounts => {
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
        assert.equal(await this.regulator.permissions(), this.permissionsStorage.address);
        assert.equal(await this.regulator.validators(), this.validatorStorage.address);
        assert(await this.regulator.isValidator(validator));

        // Set up user permissions
        await this.regulator.setWhitelistedUser(whitelisted, {from: validator}); // can burn, can transfer
        await this.regulator.setBlacklistedUser(blacklisted, {from: validator}); // can't burn, can't transfer
        await this.regulator.setNonlistedUser(nonlisted, {from: validator}); // can't burn can transfer
        await this.regulator.setMinter(minter, {from: validator}); // can mint
        assert(await this.regulator.isWhitelistedUser(whitelisted));
        assert(await this.regulator.isBlacklistedUser(blacklisted));
        assert(await this.regulator.isNonlistedUser(nonlisted));
        assert(await this.regulator.isMinter(minter));
        
        // Set up token data storage
        this.allowances = await AllowanceSheet.new({ from });
        this.balances = await BalanceSheet.new({ from });
        this.token = await PermissionedToken.new(this.allowances.address, this.balances.address, { from });
        await this.allowances.transferOwnership(this.token.address, {from});
        await this.balances.transferOwnership(this.token.address, {from});
        assert(await this.allowances.owner(), this.token.address);
        assert(await this.balances.owner(), this.token.address);
        await this.token.setRegulator(this.regulator.address, { from });
        assert.equal(await this.token.regulator(), this.regulator.address);
        assert.equal(await this.token.owner(), owner);
    });

    describe("Permissioned Token tests", function () {
        // describe("Behaves properly like a modular token", function () {
        //     modularTokenTests(minter, whitelisted, nonlisted);
        // });
        permissionedTokenStorage(owner, user)
        permissionedTokenBehavior( minter, whitelisted, blacklisted, nonlisted, user, validator )
    });
})
