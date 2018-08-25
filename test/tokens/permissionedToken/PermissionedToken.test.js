const { permissionedTokenBasicTests } = require('./permissionedTokenBehavior/PermissionedTokenBasic.js');
const { permissionedTokenBehaviorTests } = require('./permissionedTokenBehavior/PermissionedTokenBehavior.js');
const { permissionedTokenMutableStorageTests } = require('./permissionedTokenBehavior/PermissionedTokenMutableStorage');
const { PermissionedToken, PermissionedTokenStorage } = require('../../helpers/artifacts');
const { RegulatorMock } = require('../../helpers/mocks')

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

        this.regulator = await RegulatorMock.new({from:validator})

        // Set user permissions
        await this.regulator.setMinter(minter, {from:validator})
        await this.regulator.setWhitelistedUser(whitelisted, {from:validator})
        await this.regulator.setNonlistedUser(nonlisted, {from:validator})
        await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

        this.token = await PermissionedToken.new(this.regulator.address, {from:owner})
    })

    it('Permissioned Token owns its initial empty storage', async function () {
        const storage = await PermissionedTokenStorage.at(await this.token.tokenStorage())
        assert.equal(await this.token.address, await storage.owner())
    })

    describe("Permissioned Token tests", function () {
        permissionedTokenBasicTests(owner, whitelisted, nonlisted, minter);
        permissionedTokenMutableStorageTests(owner, user)
        permissionedTokenBehaviorTests( minter, whitelisted, blacklisted, nonlisted, user, validator, owner );
    });


})
