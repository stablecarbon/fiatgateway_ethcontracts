const { ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { PermissionsStorage, ValidatorStorage } = require('../helpers/artifacts');


/* Test the setting of PermissionsStorage and ValidatorsStorage that Regulator points to and uses for storage */
function regulatorStorageTests(owner, user) {
    describe("setting addresses of PermissionsStorage and ValidatorStorage", function() {

        const from = owner

        beforeEach(async function () {
            this.testPermissionsStorage = await PermissionsStorage.new({ from });
            this.testValidatorStorage = await ValidatorStorage.new({ from });
            await this.testValidatorStorage.transferOwnership(this.sheet.address, { from });
            await this.testPermissionsStorage.transferOwnership(this.sheet.address, { from });
        })

        describe('setPermissionsStorage as owner', function () {
            
            it("sets permissions storage for user", async function () {
                await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from });
                assert.equal(await this.sheet.permissions(), this.testPermissionsStorage.address);
            })

            it("emits a 'set permissions storage' event", async function () {
                const { logs } = await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from });
                assert.equal(logs.length, 2); // 2 events, one for claiming ownership, one for setting PS
                assert.equal(logs[1].event, 'SetPermissionsStorage');
                assert.equal(logs[1].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[1].args.newStorage, this.testPermissionsStorage.address);
            })
        })

        describe('setPermissionsStorage as non-owner', function () {
            
            it("reverts", async function () {
                await expectRevert(this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from: user }));
            })
        })

        describe('setValidatorStorage as owner', function () {
            
            it("sets validator storage for user", async function () {
                await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from });
                assert.equal(await this.sheet.validators(), this.testValidatorStorage.address);
            })

            it("emits a 'set validator storage' event", async function () {
                const { logs } = await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from });
                assert.equal(logs.length, 2); // see similar event catcher above
                assert.equal(logs[1].event, 'SetValidatorStorage');
                assert.equal(logs[1].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[1].args.newStorage, this.testValidatorStorage.address);
            })
        })

        describe('setValidatorStorage as non-owner', function () {
            
            it("reverts", async function () {
                await expectRevert(this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from: user }));
            })
        })
    })
}

module.exports = {
    regulatorStorageTests
}