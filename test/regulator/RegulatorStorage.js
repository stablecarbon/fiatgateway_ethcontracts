const {
    PermissionsStorage,
    ZERO_ADDRESS,
    ValidatorStorage,
} = require('../helpers/common');

function regulatorStorageTests(owner) {
    describe("REGULATOR STORAGE SETTER/GETTER TESTS", function() {
        const from = owner;

        describe('setPermissionsStorage', function () {
            it("sets permissions storage for user", async function () {
                const testPermissionsStorage = await PermissionsStorage.new({ from });
                await this.sheet.setPermissionsStorage(testPermissionsStorage.address, { from });
                assert.equal(await this.sheet.permissions(), testPermissionsStorage.address);
            })
            it("emits a 'set permissions storage' event", async function () {
                const testPermissionsStorage = await PermissionsStorage.new({ from });
                const { logs } = await this.sheet.setPermissionsStorage(testPermissionsStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetPermissionsStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, testPermissionsStorage.address);
            })
        })

        describe('setValidatorStorage', function () {
            it("sets validator storage for user", async function () {
                const testValidatorStorage = await ValidatorStorage.new({ from });
                await this.sheet.setValidatorStorage(testValidatorStorage.address, { from });
                assert.equal(await this.sheet.validators(), testValidatorStorage.address);
            })
            it("emits a 'set validator storage' event", async function () {
                const testValidatorStorage = await ValidatorStorage.new({ from });
                const { logs } = await this.sheet.setValidatorStorage(testValidatorStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetValidatorStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, testValidatorStorage.address);
            })
        })
    })
}

module.exports = {
    regulatorStorageTests
}