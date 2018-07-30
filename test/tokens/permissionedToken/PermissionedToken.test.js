const { permissionedTokenBasicTests } = require('./permissionedTokenBehavior/PermissionedTokenBasic.js');
const { permissionedTokenBehaviorTests } = require('./permissionedTokenBehavior/PermissionedTokenBehavior.js');
const { permissionedTokenMutableStorageTests } = require('./permissionedTokenBehavior/PermissionedTokenMutableStorage');
const { PermissionedToken, PermissionSheet } = require('../../helpers/artifacts');

const { PermissionedTokenMock, RegulatorFullyLoadedMock } = require('../../helpers/mocks');

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
        const from = owner
    });

    describe('PermissionedToken logic default behavior', function () {
        
        beforeEach(async function () {
            this.tokenDefault = await PermissionedToken.new({from:owner})
        })
        it('Permissioned has no storages set on construction', async function () {
            
            assert.equal(await this.tokenDefault._regulator(), ZERO_ADDRESS);
            assert.equal(await this.tokenDefault._balances(), ZERO_ADDRESS);
            assert.equal(await this.tokenDefault._allowances(), ZERO_ADDRESS);

        }) 
        it('Call to get balance and allowance revert because no storages are set', async function () {
            
            await expectRevert(this.tokenDefault.balanceOf(owner))
            await expectRevert(this.tokenDefault.approve(user, 10 * 10 ** 18, {from:owner}))
        })
        
    })

    beforeEach(async function () {

            // Set up Regulator for token
            this.permissions = await PermissionSheet.new({from:owner})
            this.regulator = await RegulatorFullyLoadedMock.new(validator, {from:owner})

            // Set user permissions
            await this.regulator.setMinter(minter, {from:validator})
            await this.regulator.setWhitelistedUser(whitelisted, {from:validator})
            await this.regulator.setNonlistedUser(nonlisted, {from:validator})
            await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

            this.token = await PermissionedTokenMock.new(this.regulator.address, {from:owner})

    })

    describe("Permissioned Token tests", function () {

        // permissionedTokenBasicTests(owner, whitelisted, nonlisted, minter);
        permissionedTokenMutableStorageTests(owner, user)
        permissionedTokenBehaviorTests( minter, whitelisted, blacklisted, nonlisted, user, validator, owner );

    });
})
