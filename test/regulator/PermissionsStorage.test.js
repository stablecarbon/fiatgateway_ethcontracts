const { expectRevert, CommonVariables } = require('../helpers/common');

const { PermissionsStorage } = require('../helpers/artifacts');

contract('PermissionsStorage', _accounts => {
    
    // Initialize common variables
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const attacker = commonVars.attacker;
    const user = commonVars.user;

    const testPermission = 0x1234;
    const testPermissionName = "Test Permission";
    const testPermissionDescription = "A test permission description.";
    const testPermissionContract = "TestContract.sol";

    beforeEach(async function () {
        this.sheet = await PermissionsStorage.new({ from: owner });
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('addPermission', function () {
            it("adds the permission with correct attributes", async function() {
                await this.sheet.addPermission(testPermission, 
                                            testPermissionName, 
                                            testPermissionDescription, 
                                            testPermissionContract, { from });
                assert(await this.sheet.isPermission(testPermission));
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
                assert(await this.sheet.isPermission(testPermission));

                // second, remove the permission
                await this.sheet.removePermission(testPermission, { from });
                const hasPermission = await this.sheet.isPermission(testPermission);
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
                
                    assert(await this.sheet.isPermission(testPermission));

                    await this.sheet.setUserPermission(user, testPermission, { from });
                    const userHasPermission = await this.sheet.hasUserPermission(user, testPermission);
                    assert(userHasPermission);

                })

                it('emits a SetUserPermission event', async function () {

                    assert(await this.sheet.isPermission(testPermission));

                    const {logs} =  await this.sheet.setUserPermission(user, testPermission, { from });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetUserPermission');
                    assert.equal(logs[0].args.who, user);
                    assert.equal(logs[0].args.methodsignature, testPermission);

                })


            })

            describe('does not add a permission first', function () {

                it('reverts', async function () {
                    permissionSet = await this.sheet.isPermission(testPermission);
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

                assert(await this.sheet.isPermission(testPermission));
                const userHasPermission = await this.sheet.hasUserPermission(user, testPermission);
                assert(userHasPermission);

                await this.sheet.removeUserPermission(user, testPermission, { from });
                const userNowHasPermission = await this.sheet.hasUserPermission(user, testPermission);
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

    describe('when the sender is not the owner', function () {
        
        const from = attacker

        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addPermission(testPermission, "", "", "", { from }));

            // add permission from owner to be removed
            await this.sheet.addPermission(testPermission, "", "", "", { from: owner });
            await expectRevert(this.sheet.removePermission(testPermission, { from }));

            await expectRevert(this.sheet.setUserPermission(user, testPermission, { from }));

            // set user permission from owner to be removed
            await this.sheet.setUserPermission(user, testPermission, { from: owner });
            await expectRevert(this.sheet.removeUserPermission(user, testPermission, { from }));
        })
    })
})