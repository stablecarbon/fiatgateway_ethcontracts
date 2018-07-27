const { expectRevert, CommonVariables } = require('../helpers/common');

const { RegulatorStorage } = require('../helpers/artifacts');

contract('RegulatorStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const validator = commonVars.validator;
    const validator2 = commonVars.validator2;

    // Test permission
    const testPermission = 0x12345678;
    const testPermissionName = "Test Permission";
    const testPermissionDescription = "A test permission description.";
    const testPermissionContract = "TestContract.sol";

    beforeEach(async function () {
        this.sheet = await RegulatorStorage.new({ from: owner })
    })

    describe('--validators--', function () {

        const from = owner

        describe('addValidator', function () {
            
            beforeEach(async function () {
                // assert that validator is not validator upon initialization
                validatorAddedBefore = await this.sheet._isValidator(validator);
                assert(!validatorAddedBefore);
            })

            it("adds one validator", async function () {
                await this.sheet.addValidator(validator, { from });
                assert(await this.sheet._isValidator(validator));
            })
            it("adds two validators", async function () {
                await this.sheet.addValidator(validator, { from });
                await this.sheet.addValidator(validator2, { from });
                assert(await this.sheet._isValidator(validator));
                assert(await this.sheet._isValidator(validator2));
            })
            it("emits a validator added event", async function () {
                const { logs } = await this.sheet.addValidator(validator, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'ValidatorAdded');
                assert.equal(logs[0].args.validator, validator);
            })
        })

        describe('removeValidator', function () {
            
            // add validator to be removed
            beforeEach(async function () {
                await this.sheet.addValidator(validator, { from });
                assert(await this.sheet._isValidator(validator));
            })

            it("removes the validator", async function () {
                await this.sheet.removeValidator(validator, { from });
                const validated = await this.sheet._isValidator(validator);
                assert(!validated);
            })
            it("emits a validator removed event", async function () {
                const { logs } = await this.sheet.removeValidator(validator, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'ValidatorRemoved');
                assert.equal(logs[0].args.validator, validator);
            })
        })
    })

    describe('--permissions--', function () {

        const from = owner

        describe('addPermission', function () {
            it("adds the permission with correct attributes", async function() {
                await this.sheet.addPermission(testPermission, 
                                            testPermissionName, 
                                            testPermissionDescription, 
                                            testPermissionContract, { from });
                assert(await this.sheet._isPermission(testPermission));
                const permissions = await this.sheet.permissions(testPermission);
                assert.equal(permissions[0], testPermissionName);
                assert.equal(permissions[1], testPermissionDescription);
                assert.equal(permissions[2], testPermissionContract);
            })
            it("emits a permission added event", async function() {
                const { logs } = await this.sheet.addPermission(testPermission, 
                                                            testPermissionName, 
                                                            testPermissionDescription, 
                                                            testPermissionContract, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'PermissionAdded');
                assert.equal(logs[0].args.methodsignature, testPermission);
            })
        })

        describe('removePermission', function () {
            it("removes the permission", async function () {
                // first, add the permission
                await this.sheet.addPermission(testPermission, 
                            testPermissionName, 
                            testPermissionDescription, 
                            testPermissionContract, { from });
                assert(await this.sheet._isPermission(testPermission));

                // second, remove the permission
                await this.sheet.removePermission(testPermission, { from });
                const hasPermission = await this.sheet._isPermission(testPermission);
                assert(!hasPermission);
            })
            it("emits a permission removed event", async function () {
                const { logs } = await this.sheet.removePermission(testPermission, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'PermissionRemoved');
                assert.equal(logs[0].args.methodsignature, testPermission);
            })
        })

        describe('setUserPermission', function () {

            describe('adds permission first', function () {
                
                beforeEach(async function () {
                    
                    // Add as possible permission before setting any user permissions
                    await this.sheet.addPermission(testPermission, 
                        testPermissionName, 
                        testPermissionDescription, 
                        testPermissionContract, { from });
                })

                it('sets the user permission', async function() {
                
                    assert(await this.sheet._isPermission(testPermission));

                    await this.sheet.setUserPermission(user, testPermission, { from });
                    const userHasPermission = await this.sheet._hasUserPermission(user, testPermission);
                    assert(userHasPermission);

                })

                it('emits a SetUserPermission event', async function () {

                    assert(await this.sheet._isPermission(testPermission));

                    const {logs} =  await this.sheet.setUserPermission(user, testPermission, { from });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetUserPermission');
                    assert.equal(logs[0].args.who, user);
                    assert.equal(logs[0].args.methodsignature, testPermission);

                })


            })

            describe('does not add a permission first', function () {

                it('reverts', async function () {
                    permissionSet = await this.sheet._isPermission(testPermission);
                    assert(!permissionSet);

                    await expectRevert(this.sheet.setUserPermission(user, testPermission, { from }));
                })
            })
            
        })

        describe('removeUserPermission', function () {
            
            beforeEach(async function () {
                
                // add as possible permission
                await this.sheet.addPermission(testPermission, 
                    testPermissionName, 
                    testPermissionDescription, 
                    testPermissionContract, { from });

                // set user permission
                await this.sheet.setUserPermission(user, testPermission, { from });
            })

            it('removes the user permission', async function () {

                assert(await this.sheet._isPermission(testPermission));
                const userHasPermission = await this.sheet._hasUserPermission(user, testPermission);
                assert(userHasPermission);

                await this.sheet.removeUserPermission(user, testPermission, { from });
                const userNowHasPermission = await this.sheet._hasUserPermission(user, testPermission);
                assert(!userNowHasPermission);

            })

            it('emits a RemovedUserPermission event', async function () {

                const { logs } = await this.sheet.removeUserPermission(user, testPermission, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'RemovedUserPermission');
                assert.equal(logs[0].args.who, user);
                assert.equal(logs[0].args.methodsignature, testPermission);

            })
        })
    })

})
