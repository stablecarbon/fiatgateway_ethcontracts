const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
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
        // this.token = await PermissionedTokenMock.new( validator, minter, whitelisted, blacklisted, nonlisted, { from } )
        // this.regulator = await RegulatorMock.new( validator, minter, whitelisted, blacklisted, nonlisted, { from });
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

        await this.regulator.setWhitelistedUser(whitelisted, {from: validator});
        await this.regulator.setBlacklistedUser(blacklisted, {from: validator});
        await this.regulator.setNonlistedUser(nonlisted, {from: validator});
        await this.regulator.setMinter(minter, {from: validator});
        assert(await this.regulator.isWhitelistedUser(whitelisted));
        assert(await this.regulator.isBlacklistedUser(blacklisted));
        assert(await this.regulator.isNonlistedUser(nonlisted));
        assert(await this.regulator.isMinter(minter));

        this.allowances = await AllowanceSheet.new({ from });
        this.balances = await BalanceSheet.new({ from });
        this.token = await PermissionedToken.new(this.allowances.address, this.balances.address, { from });
        await this.allowances.transferOwnership(this.token.address, {from});
        await this.balances.transferOwnership(this.token.address, {from});
        assert(await this.allowances.owner(), this.token.address);
        await this.token.setRegulator(this.regulator.address, { from });
        assert.equal(await this.token.regulator(), this.regulator.address);
        assert.equal(await this.token.owner(), owner);
    });

    describe("Permissioned Token tests", function () {
        permissionedTokenBehavior( minter, whitelisted, blacklisted, nonlisted, user )
    });
})
