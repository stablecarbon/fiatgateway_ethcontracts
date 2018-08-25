const { expectRevert, ZERO_ADDRESS } = require("../../../helpers/common");

const { RegulatorMock } = require('../../../helpers/mocks');


function permissionedTokenMutableStorageTests(owner, nonOwner) {
    describe("Permissioned Token Storage setting/getting tests", function () {

        beforeEach(async function () {
            // Initial Token regulator
            this.oldRegulator = await this.token.regulator()
        })
        describe('setRegulator', function () {

            const from = owner
            beforeEach(async function () {
                // create a new regulator loaded with all permissions
                this.newRegulator = (await RegulatorMock.new({from})).address
            })

            describe('owner calls', function () {
                it('changes regulator', async function () {
                    await this.token.setRegulator(this.newRegulator, { from });
                    assert.equal(await this.token.regulator(), this.newRegulator)
                })
                it('emits a ChangedRegulator event', async function () {
                    const { logs } = await this.token.setRegulator(this.newRegulator, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "ChangedRegulator")
                    assert.equal(logs[0].args.oldRegulator, this.oldRegulator)
                    assert.equal(logs[0].args.newRegulator, this.newRegulator)
                })

                describe('new regulator is a non-contract address', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setRegulator(owner, { from }));
                        await expectRevert(this.token.setRegulator(ZERO_ADDRESS, { from }));
                    })
                })
                describe('new regulator is same regulator', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setRegulator(this.oldRegulator, { from }));
                    })
                })
            })

            describe('non-owner calls', function () {
                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.token.setRegulator(this.newRegulator, { from }))
                })
            })
        })
    })
}

module.exports = {
    permissionedTokenMutableStorageTests
}
