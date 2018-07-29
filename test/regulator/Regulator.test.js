const { CommonVariables, ZERO_ADDRESS } = require('../helpers/common');

const { Regulator } = require('../helpers/artifacts');

const { regulatorStorageBasicInteractionsTests } = require('./regulatorBehavior/RegulatorStorageBasicInteractions.js');

const { regulatorUserPermissionsTests } = require('./regulatorBehavior/RegulatorUserPermissions.js');

const { regulatorMutableStorageTests } = require('./regulatorBehavior/RegulatorMutableStorage.js'); 

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;

    describe('Regulator logic construction', function () {
        beforeEach(async function () {
            this.regulatorDefault = await Regulator.new({from:owner})
        })
        it('Regulator has no storage set on construction', async function () {
            
            assert.equal(await this.regulatorDefault._storage(), ZERO_ADDRESS);

        }) 
        
    })

    describe("Regulator sets RegulatorStorage", function () {
        regulatorStorageBasicInteractionsTests(owner, user, validator, attacker);
        regulatorUserPermissionsTests(owner, user, validator);
        regulatorMutableStorageTests(owner, validator);
    })
})