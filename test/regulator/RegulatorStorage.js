const {
    PermissionsStorage,
    ZERO_ADDRESS,
    expectRevert,
    ValidatorStorage,
} = require('../helpers/common');


// Test the setting of PermissionsStorage and ValidatorsStorage that Regulator points to and uses for storage
function regulatorStorageTests(owner, user) {
    describe("setting addresses of PermissionsStorage and ValidatorStorage", function() {
        const from = owner;
        const attacker = user;

        beforeEach(async function () {
            this.testPermissionsStorage = await PermissionsStorage.new({ from });
            this.testValidatorStorage = await ValidatorStorage.new({ from });
        })

        describe('setPermissionsStorage as owner', function () {
            
            it("sets permissions storage for user", async function () {
                await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from });
                assert.equal(await this.sheet.permissions(), this.testPermissionsStorage.address);
            })

            it("emits a 'set permissions storage' event", async function () {
                const { logs } = await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetPermissionsStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, this.testPermissionsStorage.address);
            })
        })

        describe('setPermissionsStorage as non-owner', function () {
            
            it("reverts", async function () {
                await expectRevert(this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from: attacker }));
            })
        })

        describe('setValidatorStorage as owner', function () {
            
            it("sets validator storage for user", async function () {
                await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from });
                assert.equal(await this.sheet.validators(), this.testValidatorStorage.address);
            })

            it("emits a 'set validator storage' event", async function () {
                const { logs } = await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetValidatorStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, this.testValidatorStorage.address);
            })
        })

        describe('setValidatorStorage as non-owner', function () {
            
            it("reverts", async function () {
                await expectRevert(this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from: attacker }));
            })
        })
    })
}

module.exports = {
    regulatorStorageTests
}