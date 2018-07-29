const { expectRevert, ZERO_ADDRESS, RANDOM_ADDRESS } = require('../../helpers/common');

const { RegulatorStorage } = require('../../helpers/artifacts');

const { MutableStorageRegulatorMock, RegulatorStorageMock } = require('../../helpers/mocks'); 

function regulatorMutableStorageTests(owner, validator) {

    describe("MutableStorageRegulator capable of changing its RegulatorStorage", async function () {
        beforeEach(async function() {

            // Empty RegulatorStorages
            this.testRegulatorStorageInitial = await RegulatorStorage.new({ from:owner });
            this.testRegulatorStorage = await RegulatorStorage.new({from:owner})
            this.testRegulatorStorage2 = await RegulatorStorageMock.new(validator, {from:owner})

            this.sheet = await MutableStorageRegulatorMock.new(this.testRegulatorStorageInitial.address, { from:owner })


        });

        describe('Default behavior', function () {

            it('Initial storage is empty RegulatorStorage', async function () {
                const initialRegulatorStorage = await this.sheet._storage()
                assert.equal(initialRegulatorStorage, this.testRegulatorStorageInitial.address);
            })

        })

        describe('SetStorage', function () {

            describe('owner calls', function () {
                const from = owner
                beforeEach(async function () {
                    const { logs } = await this.sheet.setStorage(this.testRegulatorStorage.address, {from})
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
                    assert.equal(this.oldAddress, this.testRegulatorStorageInitial.address)
                    assert.equal(this.newAddress, this.testRegulatorStorage.address)

                })
                it('sets another new storage', async function () {
                    const { logs } = await this.sheet.setStorage(this.testRegulatorStorage2.address, {from})
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

                describe("When Regulator replaces storage, new RegulatorStorage data is reflected", function () {

                    beforeEach(async function () {

                        // storing method signatures for testing convenience
                        this.MINT_SIG = await this.testRegulatorStorage.MINT_SIG();
                        this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.testRegulatorStorage.DESTROY_BLACKLISTED_TOKENS_SIG();
                        this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.testRegulatorStorage.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG();
                        this.BURN_SIG = await this.testRegulatorStorage.BURN_SIG();
                        this.BLACKLISTED_SIG = await this.testRegulatorStorage.BLACKLISTED_SIG();

                    })
                    it('old storage has no validator and no permissions', async function () {
                        assert(!(await this.sheet.isValidator(validator)));
                    })

                    describe('replacing regulator storage to one preloaded with permissions', function () {
                        beforeEach(async function () {
                            await this.sheet.setStorage(this.testRegulatorStorage2.address, {from})
                        })
                        it('new sheet has the validator', async function () {

                            assert(await this.sheet.isValidator(validator))

                        })
                        it('new sheet has permissions set', async function () {
                            assert(await this.sheet.isPermission(this.MINT_SIG))
                            assert(await this.sheet.isPermission(this.DESTROY_BLACKLISTED_TOKENS_SIG))
                            assert(await this.sheet.isPermission(this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG))
                            assert(await this.sheet.isPermission(this.BURN_SIG))
                            assert(await this.sheet.isPermission(this.BLACKLISTED_SIG))

                        })
                    })
                })
            })
            describe('non-owner calls', function () {
                const from = validator
                it('reverts', async function () {
                    await expectRevert(this.sheet.setStorage(this.testRegulatorStorage.address, {from}))
                })
            })

        })
    })
}

module.exports = {
    regulatorMutableStorageTests
}