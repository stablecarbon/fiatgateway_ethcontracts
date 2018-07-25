const { permissionedTokenBehavior } = require('./PermissionedTokenBehavior');
const { PermissionedTokenMock } = require('../../helpers/mocks');
const { PermissionedToken } = require('../../helpers/artifacts');

const { CommonVariables } = require('../../helpers/common');

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
        this.token = await PermissionedToken.new({ from });
    });

    describe("Permissioned Token tests", function () {
        permissionedTokenBehavior( validator, minter, whitelisted, blacklisted, nonlisted )
    });
})
