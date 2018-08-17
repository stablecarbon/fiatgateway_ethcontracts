const { expectRevert } = require('../../helpers/common');

const { PermissionSheet, ValidatorSheet, Regulator } = require('../../helpers/artifacts');

/**
* 
* @dev testing Regulator ability to modify RegulatorStorage parameters
*
*/
function regulatorStorageBasicInteractionsTests(owner, user, validator, attacker) {
    
    describe('Regulator sets empty RegulatorStorage', function () {

        describe("Testing Regulator basic ability to SET/GET permissions and validators mappings", function () {
            
            beforeEach(async function () {

                this.permissionSheet = await PermissionSheet.new({ from:owner })
                this.validatorSheet = await ValidatorSheet.new({ from:owner })

                this.sheet = await Regulator.new(this.permissionSheet.address, this.validatorSheet.address, { from:owner })

                // Must transfer and claim ownership
                await this.permissionSheet.transferOwnership(this.sheet.address, {from:owner})
                await this.validatorSheet.transferOwnership(this.sheet.address, {from:owner})
                await this.sheet.claimPermissionOwnership()
                await this.sheet.claimValidatorOwnership()

                // Test Permission
                this.testPermission = 0x12345678;
                this.testPermissionName = "Test Permission";
                this.testPermissionDescription = "A test permission description.";
                this.testPermissionContract = "A Contract.sol";

            })

            describe("Regulator Storage Interactions with Permission Storage", function () {
                describe('when the sender is a validator', function () {
                    const from = validator;

                    beforeEach(async function () {
                        
                        // test that validator isn't added initially
                        const validatorAdded = await this.sheet.isValidator(validator);
                        assert(!validatorAdded);

                        // add the validator
                        await this.sheet.addValidator(validator, {from : owner});
                        assert(await this.sheet.isValidator(validator));

                        // check that test permission isn't added initially
                        const testPermissionAdded = await this.sheet.isPermission(this.testPermission);
                        assert(!testPermissionAdded);

                        // add the test permission
                        await this.sheet.addPermission(this.testPermission,
                                this.testPermissionName,
                                this.testPermissionDescription,
                                this.testPermissionContract, { from });
                        assert(await this.sheet.isPermission(this.testPermission));

                    })

                    describe('addPermission', function () {
                        it("adds the permission with correct metadata", async function () {
                            const permissions = await this.sheet.getPermission(this.testPermission);
                            assert.equal(permissions[0], this.testPermissionName);
                            assert.equal(permissions[1], this.testPermissionDescription);
                            assert.equal(permissions[2], this.testPermissionContract);
                        })
                    })

                    describe('removePermission', function () {
                        it("removes the permission", async function () {
                            await this.sheet.removePermission(this.testPermission, { from });
                            const hasPermission = await this.sheet.isPermission(this.testPermission);
                            assert(!hasPermission);
                        })
                    })

                    describe('setUserPermission', function () {
                        it("adds permission for user", async function () {
                            await this.sheet.setUserPermission(user, this.testPermission, { from });
                            assert(await this.sheet.hasUserPermission(user, this.testPermission));
                        })
                    })

                    describe('removeUserPermission', function () {
                        it('removes the permission for the user', async function () {
                            await this.sheet.setUserPermission(user, this.testPermission, { from });
                            assert(await this.sheet.hasUserPermission(user, this.testPermission));
                            await this.sheet.removeUserPermission(user, this.testPermission, { from });
                            assert(!(await this.sheet.hasUserPermission(user, this.testPermission)));
                        })
                    })
                })

                describe('when the sender is not a validator', function () {
                    const from = owner
                    it('reverts all calls', async function () {
                        await expectRevert(this.sheet.addPermission(this.testPermission, "", "", "", { from }));
                        await expectRevert(this.sheet.removePermission(this.testPermission, { from }));
                        await expectRevert(this.sheet.setUserPermission(user, this.testPermission, { from }));
                        await expectRevert(this.sheet.removeUserPermission(user, this.testPermission, { from }));
                    })
                })

            });

            describe("Regulator Storage Interactions with Validator Storage", function () {
                describe('when the sender is the owner', function () {
                    const from = owner

                    beforeEach( async function () {
                        const validatorAdded = await this.sheet.isValidator(validator);
                        assert(!validatorAdded);
                        await this.sheet.addValidator(validator, { from });
                    })
                    describe('addValidator', function () {
                        it("adds a validator", async function () {
                            assert(await this.sheet.isValidator(validator));
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
                    const from = attacker
                    it('reverts all calls', async function () {
                        await expectRevert(this.sheet.addValidator(validator, { from }));
                        await expectRevert(this.sheet.removeValidator(validator, { from }));
                    })
                })
            });

        });

    })

}

module.exports = {
    regulatorStorageBasicInteractionsTests
}