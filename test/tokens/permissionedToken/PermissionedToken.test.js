const { permissionedTokenBasicTests } = require('./permissionedTokenBehavior/PermissionedTokenBasic.js');
const { permissionedTokenBehaviorTests } = require('./permissionedTokenBehavior/PermissionedTokenBehavior.js');
const { permissionedTokenMutableStorageTests } = require('./permissionedTokenBehavior/PermissionedTokenMutableStorage');
const { PermissionedToken, Regulator, BalanceSheet, AllowanceSheet } = require('../../helpers/artifacts');

const { PermissionSheetMock, ValidatorSheetMock } = require('../../helpers/mocks');

const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../../helpers/common');

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
        // Set up Regulator for token
        this.permissionSheet = await PermissionSheetMock.new( {from:owner })
        this.validatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )

        this.regulator = await Regulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})

        await this.permissionSheet.transferOwnership(this.regulator.address, {from:owner})
        await this.validatorSheet.transferOwnership(this.regulator.address, {from:owner})
        await this.regulator.claimPermissionOwnership()
        await this.regulator.claimValidatorOwnership()

        // Set user permissions
        await this.regulator.setMinter(minter, {from:validator})
        await this.regulator.setWhitelistedUser(whitelisted, {from:validator})
        await this.regulator.setNonlistedUser(nonlisted, {from:validator})
        await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

        // Set up token storage
        this.balanceSheet = await BalanceSheet.new({from:owner})
        this.allowanceSheet = await AllowanceSheet.new({from:owner})

        this.token = await PermissionedToken.new(this.regulator.address, this.balanceSheet.address, this.allowanceSheet.address, {from:owner})

        await this.balanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.allowanceSheet.transferOwnership(this.token.address, {from:owner})
        await this.token.claimBalanceOwnership()
        await this.token.claimAllowanceOwnership()
    })


    describe("Permissioned Token tests", function () {
        permissionedTokenBasicTests(owner, whitelisted, nonlisted, minter);
        // permissionedTokenMutableStorageTests(owner, user)
        permissionedTokenBehaviorTests( minter, whitelisted, blacklisted, nonlisted, user, validator, owner );
    });
})
