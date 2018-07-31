const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { Regulator, PermissionSheet, ValidatorSheet } = require('../helpers/artifacts');

const { regulatorStorageBasicInteractionsTests } = require('./regulatorBehavior/RegulatorStorageBasicInteractions.js');

const { regulatorUserPermissionsTests } = require('./regulatorBehavior/RegulatorUserPermissions.js');

const { regulatorMutableStorageTests } = require('./regulatorBehavior/RegulatorMutableStorage.js'); 

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;

    describe('Regulator logic default behavior', function () {
        beforeEach(async function () {
            this.permissions = await PermissionSheet.new({ from:owner })
            this.validators = await ValidatorSheet.new({ from:owner })
            this.regulatorDefault = await Regulator.new(this.permissions.address, this.validators.address, {from:owner})

            this.testPermission = 0x12345678;
        })
        it('Regulator has storages set on construction', async function () {
            
            assert.equal(await this.regulatorDefault.permissions(), this.permissions.address);
            assert.equal(await this.regulatorDefault.validators(), this.validators.address);

        }) 
        
    })

    describe("Regulator sets RegulatorStorage", function () {
        regulatorStorageBasicInteractionsTests(owner, user, validator, attacker);
        regulatorUserPermissionsTests(owner, user, validator);
        regulatorMutableStorageTests(owner, validator);
    })
})