const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
const { PermissionedTokenMock, RegulatorMock } = require('../../helpers/mocks');
const { PermissionedToken, Regulator, PermissionsStorage, ValidatorStorage, BalanceSheet, AllowanceSheet, MutablePermissionedToken } = require('../../helpers/artifacts');

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
        this.permissionsStorage = await PermissionsStorage.new({ from });
        this.validatorStorage = await ValidatorStorage.new({ from });
        await this.permissionsStorage.transferOwnership(this.regulator.address, { from });
        await this.validatorStorage.transferOwnership(this.regulator.address, { from });
        await this.regulator.setPermissionsStorage(this.permissionsStorage.address, { from });
        await this.regulator.setValidatorStorage(this.validatorStorage.address, { from });
        assert.equal(await this.regulator.permissions(), this.permissionsStorage.address);
        assert.equal(await this.regulator.validators(), this.validatorStorage.address);

        // Set up token data storage contracts and connect to token
        this.allowance = await AllowanceSheet.new({ from });
        this.balance = await BalanceSheet.new({ from });
        // this.token = await MutablePermissionedToken.new(this.allowance.address, this.balance.address, { from });
        this.token = await PermissionedToken.new(this.allowance.address, this.balance.address, { from });
        await this.allowance.transferOwnership(this.token.address, { from });
        await this.balance.transferOwnership(this.token.address, { from });

        // Modify regulator and connect to permissioned token
        await this.regulator.addValidator(validator, { from });
        await this.token.setRegulatorProxy(this.regulator.address, { from });


        // assert.equal(await this.token.rProxy(), this.regulator.address);
        // assert.equal(this.token.owner(), owner);
    });

    describe("Permissioned Token tests", function () {
        permissionedTokenBehavior( validator, minter, whitelisted, blacklisted, nonlisted )
    });
})
