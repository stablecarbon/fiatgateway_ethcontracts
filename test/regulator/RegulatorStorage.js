const { ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { PermissionsStorage, ValidatorStorage } = require('../helpers/artifacts');


/* Test the setting of PermissionsStorage and ValidatorsStorage that Regulator points to and uses for storage */
function regulatorStorageTests(owner, user) {
    describe("setting addresses of PermissionsStorage and ValidatorStorage", function() {

        const from = owner

        beforeEach(async function () {
            this.testPermissionsStorage = await PermissionsStorage.new({ from });
            this.testValidatorStorage = await ValidatorStorage.new({ from });
        })

        describe('setPermissionsStorage as owner', function () {
            describe("permissions storage is an actual contract", function () {
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
            describe("permissions storage is not an actual contract", function () {
                it("reverts", async function () {
                    await expectRevert(this.sheet.setPermissionsStorage(from, { from }));
                    assert.equal(await this.sheet.permissions(), ZERO_ADDRESS);
                })
            })
        })

        describe('setPermissionsStorage as non-owner', function () {
            it("reverts", async function () {
                await expectRevert(this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from: user }));
            })
        })

        describe('setValidatorStorage as owner', function () {
            describe("validator storage is an actual contract", function() {
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
            describe("validator storage is not an actual contract", function () {
               it("reverts", async function () {
                   await expectRevert(this.sheet.setValidatorStorage(from, { from }));
                   assert.equal(await this.sheet.validators(), ZERO_ADDRESS);
               }) 
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