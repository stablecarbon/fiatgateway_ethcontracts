// Slightly modified from https://github.com/trusttoken/trueUSD

/* Loading all libraries from common */
const {
    CommonVariables,
    expectRevert,
    PermissionStorage,
} = require('../helpers/common');

contract('PermissionStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const account2 = commonVars.userSender;
    const testPermission = 0x12345678;
    const testPermissionName = "Test Permission";
    const testPermissionDescription = "A test permission description.";
    const testPermissionContract = "No Contract";

    beforeEach(async function () {
        this.sheet = await PermissionStorage.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('addPermission', function () {
            it("adds the permission", async function() {
                await this.sheet.addPermission(testPermission, 
                                            testPermissionName, 
                                            testPermissionDescription, 
                                            testPermissionContract, { from });
                assert(this.sheet.isPermission(testPermission));
                const permissions = await this.sheet.permissions(testPermission);
                // TODO check if permission data was set.
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
                await this.sheet.removePermission(testPermission, { from });
                assert.equal(this.sheet.isPermission(testPermission), false);
            })
            it("emits a permission removed event", async function () {
                const { logs } = await this.sheet.removePermission(testPermission, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'PermissionRemoved');
                assert.equal(logs[0].args.methodsignature, testPermission);
            })
        })
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addPermission(testPermission, "", "", "", {from}));
            await expectRevert(this.sheet.removePermission(testPermission, { from }));
        })
    })
})