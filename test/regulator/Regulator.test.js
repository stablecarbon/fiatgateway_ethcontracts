const { CommonVariables } = require('../helpers/common');

const { Regulator } = require('../helpers/artifacts');

const { regulatorStorageTests } = require('./RegulatorStorage.js');

const { regulatorStorageInteractionsTests } = require('./RegulatorStorageInteractions.js');

const { regulatorPermissionsTests } = require('./RegulatorPermissions.js');

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = commonVars.validator;
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