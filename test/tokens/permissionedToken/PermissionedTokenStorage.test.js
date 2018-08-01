const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');

const { BalanceSheet, AllowanceSheet } = require('../../helpers/artifacts');

const { permissionedTokenStorageTests } = require('./permissionedTokenStorageBehavior/PermissionedTokenStorage.js');


contract('PermissionedTokenStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const tokenHolder = commonVars.user2;
    const spender = commonVars.user3;

    beforeEach(async function () {
        this.balanceSheet = await BalanceSheet.new({from:owner})
        this.allowanceSheet = await AllowanceSheet.new({from:owner})
    })

    describe("PermissionedTokenStorage tests", function () {
        permissionedTokenStorageTests(owner, tokenHolder, spender, user);
    })
})
