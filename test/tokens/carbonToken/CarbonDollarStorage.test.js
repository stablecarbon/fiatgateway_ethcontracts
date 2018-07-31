const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');

const { FeeSheet } = require('../../helpers/artifacts');

const { carbonTokenStorageTests } = require('./carbonTokenStorageBehavior/CarbonTokenStorage.js');


contract('PermissionedTokenStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const tokenHolder = commonVars.user2;
    const spender = commonVars.user3;

    beforeEach(async function () {
        this.feeSheet = await FeeSheet.new({from:owner})
    })

    describe("PermissionedTokenStorage tests", function () {
       carbonTokenStorageTests(owner, tokenHolder, spender, user);
    })

})
