const {
    PermissionsStorage,
    ValidatorStorage,
    expectRevert
} = require('../helpers/common');

function regulatorStorageInteractionsTests(owner, account2, validator, validator2) {
    describe("Regulator Storage Interactions Tests", function () {
        beforeEach(async function () {
            this.testPermissionsStorage = await PermissionsStorage.new({ from: owner });
            this.testValidatorStorage = await ValidatorStorage.new({ from: owner });

            this.testPermission = 0x12345678;
            this.testPermissionName = "Test Permission";
            this.testPermissionDescription = "A test permission description.";
            this.testPermissionContract = "No Contract";

            await this.testValidatorStorage.transferOwnership(this.sheet.address, { from: owner });
            await this.testPermissionsStorage.transferOwnership(this.sheet.address, { from: owner });
            await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from: owner });
            await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from: owner });
            await this.sheet.claimStorageOwnership({ from: owner });
        });

        describe("Regulator Storage Interactions with Permission Storage", function () {
            describe('when the sender is a validator', function () {
                const from = validator;

                beforeEach(function () {
                    this.sheet.addValidator(validator, {from : owner});
                })

                describe('addPermission', function () {
                    it("adds the permission", async function () {
                        await this.sheet.addPermission(this.testPermission,
                            this.testPermissionName,
                            this.testPermissionDescription,
                            this.testPermissionContract, { from });
                        assert(await this.sheet.isPermission(this.testPermission));
                        const permissions = await this.sheet.getPermission(this.testPermission);
                        // TODO check if permission data was set.
                    })
                })

                describe('removePermission', function () {
                    it("removes the permission", async function () {
                        await this.sheet.removePermission(this.testPermission, { from });
                        const hasPermission = await this.sheet.isPermission(this.testPermission);
                        assert(!hasPermission);
                    })
                })
            })

            describe('when the sender is not a validator but is owner', function () {
                const from = owner
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.addPermission(this.testPermission, "", "", "", { from }));
                    await expectRevert(this.sheet.removePermission(this.testPermission, { from }));
                })
            })

            describe('when the sender is not a validator and is not owner', function () {
                const from = account2
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.addPermission(this.testPermission, "", "", "", { from }));
                    await expectRevert(this.sheet.removePermission(this.testPermission, { from }));
                })
            })
        });

        describe("Regulator Storage Interactions with Validator Storage", function () {
            describe('when the sender is the owner', function () {
                const from = owner

                describe('addValidator', function () {
                    it("adds one validator", async function () {
                        await this.sheet.addValidator(validator, { from });
                        assert(await this.sheet.isValidator(validator));
                    })
                    it("adds two validators", async function () {
                        await this.sheet.addValidator(validator, { from });
                        await this.sheet.addValidator(validator2, { from });
                        assert(await this.sheet.isValidator(validator));
                        assert(await this.sheet.isValidator(validator2));
                    })
                })

                describe('removeValidator', function () {
                    it("removes the validator", async function () {
                        await this.sheet.removeValidator(validator, { from });
                        const validated = await this.sheet.isValidator(validator);
                        assert(!validated);
                    })
                })
            })

            describe('when the sender is not the owner', function () {
                const from = account2
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.addValidator(validator, { from }));
                    await expectRevert(this.sheet.removeValidator(validator, { from }));
                })
            })
        });
    });
}

module.exports = {
    regulatorStorageInteractionsTests
}