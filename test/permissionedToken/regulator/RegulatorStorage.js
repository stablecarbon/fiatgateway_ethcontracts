const {
    PermissionStorageMock,
    UserPermissionsStorage,
    ZERO_ADDRESS,
    ValidatorStorage,
} = require('../../helpers/common');

function regulatorStorageTests(owner) {
    describe("REGULATOR STORAGE SETTER/GETTER TESTS", function() {
        const from = owner;
        describe('setPermissionStorage', function () {
            it("sets permission storage", async function () {
                const testPermissionStorage = await PermissionStorageMock.new({ from });
                await this.sheet.setPermissionStorage(testPermissionStorage.address, { from });
                assert.equal(await this.sheet.availablePermissions(), testPermissionStorage.address);
            })
            it("emits a 'set permission storage' event", async function () {
                const testPermissionStorage = await PermissionStorageMock.new({ from });
                const { logs } = await this.sheet.setPermissionStorage(testPermissionStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetPermissionStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, testPermissionStorage.address);
            })
        })

        describe('setUserPermissionsStorage', function () {
            it("sets user permission storage for user", async function () {
                const testUserPermissionsStorage = await UserPermissionsStorage.new({ from });
                await this.sheet.setUserPermissionsStorage(testUserPermissionsStorage.address, { from });
                assert.equal(await this.sheet.userPermissions(), testUserPermissionsStorage.address);
            })
            it("emits a 'set user permission storage' event", async function () {
                const testUserPermissionsStorage = await UserPermissionsStorage.new({ from });
                const { logs } = await this.sheet.setUserPermissionsStorage(testUserPermissionsStorage.address, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetUserPermissionsStorage');
                assert.equal(logs[0].args.oldStorage, ZERO_ADDRESS);
                assert.equal(logs[0].args.newStorage, testUserPermissionsStorage.address);
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