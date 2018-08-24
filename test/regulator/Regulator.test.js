const { CommonVariables } = require('../helpers/common')
const { regulatorStorageBasicInteractionsTests } = require('./regulatorBehavior/RegulatorStorageBasicInteractions.js');
const { regulatorUserPermissionsTests } = require('./regulatorBehavior/RegulatorUserPermissions.js');


contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;

    describe("Regulator behavior tests", function () {
        regulatorStorageBasicInteractionsTests(owner, user, validator, attacker);
        regulatorUserPermissionsTests(owner, user);
    })
})