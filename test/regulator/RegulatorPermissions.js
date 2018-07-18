const {
    expectRevert
} = require('../helpers/common');

function regulatorPermissionsTests(owner, user, otherAccount, testPermission) {
    describe("REGULATOR USER PERMISSION SETTING/GETTING", async function () {

        describe('when the sender is the owner', function () {
            const from = owner

            describe('setUserPermission', function () {
                it("adds permission for user", async function () {
                    await this.sheet.setUserPermission(user, testPermission, { from });
                    assert(await this.sheet.hasUserPermission(user, testPermission));
                })
                it("emits a permission added event", async function () {
                    const { logs } = await this.sheet.setUserPermission(user, testPermission, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetUserPermission');
                    assert.equal(logs[0].args.who, user);
                    assert.equal(logs[0].args.methodsignature, testPermission);
                })
            })

            describe('removePermission', function () {
                it("removes permission for user", async function () {
                    await this.sheet.removeUserPermission(user, testPermission, { from });
                    assert(!(await this.sheet.hasUserPermission(user, testPermission)));
                })
                it("emits a permission removed event", async function () {
                    const { logs } = await this.sheet.removeUserPermission(user, testPermission, { from });
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
                await expectRevert(this.sheet.setUserPermission(user, testPermission, { from }));
                await expectRevert(this.sheet.removeUserPermission(user, testPermission, { from }));
            })
        })
    })
}

module.exports = {
    regulatorPermissionsTests
}