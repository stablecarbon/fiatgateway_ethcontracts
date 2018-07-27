const { CommonVariables } = require('../helpers/common');

const { RegulatorStorage } = require('../helpers/artifacts');

const { regulatorStorageTests } = require('./regulatorStorageBehavior/RegulatorStorage.js');


contract('RegulatorStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const validator = commonVars.validator;
    const validator2 = commonVars.validator2;

    beforeEach(async function () {
        this.sheet = await RegulatorStorage.new({ from: owner })
    })

    describe("RegulatorStorage tests", function () {
        regulatorStorageTests(owner, user, attacker, validator, validator2);
    })

})
