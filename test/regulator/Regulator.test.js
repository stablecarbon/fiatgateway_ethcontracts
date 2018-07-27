const { CommonVariables } = require('../helpers/common');

const { Regulator } = require('../helpers/artifacts');

const { regulatorStorageInteractionsTests } = require('./regulatorBehavior/RegulatorStorageInteractions.js');

const { regulatorPermissionsTests } = require('./regulatorBehavior/RegulatorPermissions.js');

const { regulatorStorageConsumerTests } = require('./regulatorBehavior/MutableRegulatorStorageConsumer.js'); 

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
        regulatorStorageInteractionsTests(owner, user, validator, attacker);
        regulatorPermissionsTests(owner, user, validator);
        regulatorStorageConsumerTests(owner);
    })
})