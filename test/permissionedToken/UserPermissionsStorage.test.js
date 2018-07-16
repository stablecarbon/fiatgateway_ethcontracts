const {
    CommonVariables,
    expectRevert,
    UserPermissionsStorage,
} = require('../helpers/common');

contract('UserPermissionsStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const user = commonVars.userSender;
    const otherAccount = commonVars.userReceiver;
    const testPermission = 0x12345678;

    beforeEach(async function () {
        this.sheet = await UserPermissionsStorage.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('setPermission', function () {
            it("adds permission for user", async function () {
                await this.sheet.setPermission(user, testPermission, { from });
                assert(await this.sheet.hasPermission(user, testPermission));
            })
            it("emits a permission added event", async function () {
                const { logs } = await this.sheet.setPermission(user, testPermission, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'SetUserPermission');
                assert.equal(logs[0].args.who, user);
                assert.equal(logs[0].args.methodsignature, testPermission);
            })
        })

        describe('removePermission', function () {
            it("removes permission for user", async function () {
                await this.sheet.removePermission(user, testPermission, { from });
                assert(!(await this.sheet.hasPermission(user, testPermission)));
            })
            it("emits a permission removed event", async function () {
                const { logs } = await this.sheet.removePermission(user, testPermission, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'RemovedUserPermission');
                assert.equal(logs[0].args.who, user);
                assert.equal(logs[0].args.methodsignature, testPermission);
            })
        })
    })

    describe('when the sender is not the owner', function () {
        const from = otherAccount
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.setPermission(user, testPermission, { from }));
            await expectRevert(this.sheet.removePermission(user, testPermission, { from }));
        })
    })
})