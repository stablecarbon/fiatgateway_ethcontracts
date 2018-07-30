const { modularTokenTests } = require('../ModularTokenTests');
// const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
// const { permissionedTokenStorage } = require('./PermissionedTokenStorage');
const { PermissionedToken, PermissionedTokenStorageState } = require('../../helpers/artifacts');

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
    });

    describe('PermissionedToken logic default behavior', function () {
        
        beforeEach(async function () {
            this.tokenDefault = await PermissionedTokenStorageState.new({from:owner})
            this.token = await PermissionedToken.new({from:owner})
        })
        // it('Permissioned has no storages set on construction', async function () {
            
        //     assert.equal(await this.tokenDefault._regulator(), ZERO_ADDRESS);
        //     assert.equal(await this.tokenDefault._balances(), ZERO_ADDRESS);
        //     assert.equal(await this.tokenDefault._allowances(), ZERO_ADDRESS);

        // }) 
        // it('Call to get balance and allowance revert because no storages are set', async function () {
            
        //     await expectRevert(this.tokenDefault.balanceOf(owner))
        //     await expectRevert(this.tokenDefault.allowanceOf(owner))
        // })
        it('tets', async function () {
            assert(true)
        })
        
    })

    describe("Permissioned Token tests", function () {
        // describe("Behaves properly like a modular token", function () {
        //     modularTokenTests(owner, whitelisted, nonlisted, minter);
        // });
        // describe("PermissionedToken set Regulator properly", function () {
        //     permissionedTokenStorage(owner, user)
        // })
        // describe("PermissionedToken abides by regulator", function () {
        //     permissionedTokenBehavior( minter, whitelisted, blacklisted, nonlisted, user, validator, owner );
        // });
    });
})
