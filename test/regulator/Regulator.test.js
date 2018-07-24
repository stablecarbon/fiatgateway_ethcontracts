const { CommonVariables } = require('../helpers/common');

const { Regulator } = require('../helpers/artifacts');

const { regulatorStorageTests } = require('./RegulatorStorage');

const { regulatorStorageInteractionsTests } = require('./RegulatorStorageInteractions');

const { regulatorPermissionsTests } = require('./RegulatorPermissions');

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const user = commonVars.user;
    const attacker = commonVars.attacker;

    beforeEach(async function () {
        this.sheet = await Regulator.new({ from: owner });
    })

    describe("Regulator tests", function () {
        regulatorStorageTests(owner, user);
        regulatorStorageInteractionsTests(owner, user, validator, attacker);
        regulatorPermissionsTests(owner, user, validator);
    })
})