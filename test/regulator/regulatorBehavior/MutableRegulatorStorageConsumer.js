const { expectRevert, ZERO_ADDRESS, RANDOM_ADDRESS } = require('../../helpers/common');

const { RegulatorStorage } = require('../../helpers/artifacts');

function regulatorStorageConsumerTests(owner) {

    describe("Setting MutableRegulatorStorage tests", async function () {
        beforeEach(async function() {

            // Instantiate RegulatorsMock that comes pre-loaded with all function permissions and one validator
            this.testRegulatorStorage = await RegulatorStorage.new({ from:owner });
            this.testRegulatorStorage2 = await RegulatorStorage.new({ from:owner });


        });

        describe('Default behavior', function () {

            it('Initial storage is zero address', async function () {
                const initialRegulatorStorage = await this.sheet._storage()
                assert.equal(initialRegulatorStorage, ZERO_ADDRESS);
            })

        })

        describe('SetStorage', function () {

            beforeEach(async function () {
                const { logs } = await this.sheet.setStorage(this.testRegulatorStorage.address)
                this.logs = logs
                this.event = this.logs.find(l => l.event === 'ChangedRegulatorStorage').event
                this.oldAddress = this.logs.find(l => l.event === 'ChangedRegulatorStorage').args._old
                this.newAddress = this.logs.find(l => l.event === 'ChangedRegulatorStorage').args._new

            })
            it('sets new storage', async function () {
                const newStorage = await this.sheet._storage()
                assert.equal(this.testRegulatorStorage.address, newStorage)
            })
            it('emits a ChangedRegulatorStorage event', async function () {
                assert.equal(this.logs.length, 1)
                assert.equal(this.event, "ChangedRegulatorStorage")
                assert.equal(this.oldAddress, ZERO_ADDRESS)
                assert.equal(this.newAddress, this.testRegulatorStorage.address)

            })
            it('sets another new storage', async function () {
                const { logs } = await this.sheet.setStorage(this.testRegulatorStorage2.address)
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, "ChangedRegulatorStorage")
                assert.equal(logs[0].args._old, this.testRegulatorStorage.address)
                assert.equal(logs[0].args._new, this.testRegulatorStorage2.address)
            })
            it('cannot set new storage to point to old storage', async function () {
                await expectRevert(this.sheet.setStorage(this.testRegulatorStorage.address))
            })
            it('cannot set storage to an address that is not a contract', async function () {
                await expectRevert(this.sheet.setStorage(ZERO_ADDRESS))
                await expectRevert(this.sheet.setStorage(owner))
                await expectRevert(this.sheet.setStorage(RANDOM_ADDRESS))
            })
            it('cannot set user permission if no permissions are set', async function () {
                // validator needs to set roles
                await this.sheet.addValidator(owner, { from:owner })
                await expectRevert(this.sheet.setMinter(owner, { from:owner }))
                await expectRevert(this.sheet.setBlacklistSpender(owner, { from:owner }))
                await expectRevert(this.sheet.setBlacklistDestroyer(owner, { from:owner }))
                await expectRevert(this.sheet.setWhitelistedUser(owner, { from:owner }))
                await expectRevert(this.sheet.setNonlistedUser(owner, { from:owner }))
                await expectRevert(this.sheet.setBlacklistedUser(owner, { from:owner }))

            })
            it('can set user permissions if permissions are set', async function () {
                // validator needs to set roles
                await this.sheet.addValidator(owner, { from:owner })

                await this.sheet.addPermission(await this.testRegulatorStorage.MINT_SIG(), '','','', {from:owner})
                await this.sheet.setMinter(owner, { from:owner })
                assert(await this.sheet.isMinter(owner))

                await this.sheet.addPermission(await this.testRegulatorStorage.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG(), '','','', {from:owner})
                await this.sheet.setBlacklistSpender(owner, { from:owner })
                assert(await this.sheet.isBlacklistSpender(owner))

                await this.sheet.addPermission(await this.testRegulatorStorage.DESTROY_BLACKLISTED_TOKENS_SIG(), '','','', {from:owner})
                await this.sheet.setBlacklistDestroyer(owner, { from:owner })
                assert(await this.sheet.isBlacklistDestroyer(owner))

                await this.sheet.addPermission(await this.testRegulatorStorage.BLACKLISTED_SIG(), '','','', {from:owner})
                await this.sheet.addPermission(await this.testRegulatorStorage.BURN_SIG(), '','','', {from:owner})
                await this.sheet.setWhitelistedUser(owner, { from:owner })
                assert(await this.sheet.isWhitelistedUser(owner))
                await this.sheet.setNonlistedUser(owner, { from:owner })
                assert(await this.sheet.isNonlistedUser(owner))
                await this.sheet.setBlacklistedUser(owner, { from:owner })
                assert(await this.sheet.isBlacklistedUser(owner))
            })
        })
    })
}

module.exports = {
    regulatorStorageConsumerTests
}