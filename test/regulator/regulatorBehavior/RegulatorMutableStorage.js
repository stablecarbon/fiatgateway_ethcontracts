const { expectRevert, ZERO_ADDRESS, RANDOM_ADDRESS } = require('../../helpers/common');

const { PermissionSheet, ValidatorSheet, Regulator } = require('../../helpers/artifacts');

function regulatorMutableStorageTests(owner, validator) {

    describe("MutableStorageRegulator capable of changing its PermissionStorage and ValidatorStorage", async function () {
        beforeEach(async function() {

            // Empty RegulatorStorages
            this.permissionSheetInitial = await PermissionSheet.new({from:owner})
            this.validatorSheetInitial = await ValidatorSheet.new({from:owner})
            this.permissionSheet = await PermissionSheet.new({from:owner})
            this.validatorSheet = await ValidatorSheet.new({from:owner})

            this.permissionSheet2 = await PermissionSheet.new({from:owner})
            this.validatorSheet2 = await ValidatorSheet.new({from:owner})

            this.sheet = await Regulator.new(this.permissionSheetInitial.address, this.validatorSheetInitial.address, { from:owner })

        });

        describe('Default behavior', function () {

            it('Initial storage is empty RegulatorStorage', async function () {
                const initialPermissionStorage = await this.sheet.permissions()
                const initialValidatorStorage = await this.sheet.validators()

                assert.equal(initialPermissionStorage, this.permissionSheetInitial.address);
                assert.equal(initialValidatorStorage, this.validatorSheetInitial.address);

            })

        })

        describe('SetPermissionStorage and SetValidatorStorage', function () {

            describe('owner calls', function () {
                const from = owner
                beforeEach(async function () {
                    
                    const { logs } = await this.sheet.setPermissionStorage(this.permissionSheet.address, {from})
                    
                    this.logsP = logs
                    this.eventP = this.logsP.find(l => l.event === 'ChangedPermissionStorage').event
                    this.oldAddressP = this.logsP.find(l => l.event === 'ChangedPermissionStorage').args._old
                    this.newAddressP = this.logsP.find(l => l.event === 'ChangedPermissionStorage').args._new

                    // Can only read one logs per scope?
                    await this.sheet.setValidatorStorage(this.validatorSheet.address, {from})

                    await this.permissionSheet.transferOwnership(this.sheet.address, {from:owner})
                    await this.validatorSheet.transferOwnership(this.sheet.address, {from:owner})
                    await this.sheet.claimPermissionOwnership()
                    await this.sheet.claimValidatorOwnership()

                })
                it('sets new permission and validator storage', async function () {
                    const newPermissionStorage = await this.sheet.permissions()
                    const newValidatorStorage = await this.sheet.validators()
                    assert.equal(this.permissionSheet.address, newPermissionStorage)
                    assert.equal(this.validatorSheet.address, newValidatorStorage)

                })
                it('emits a ChangedPermissionStorage event', async function () {
                    assert.equal(this.logsP.length, 1)
                    assert.equal(this.eventP, "ChangedPermissionStorage")
                    assert.equal(this.oldAddressP, this.permissionSheetInitial.address)
                    assert.equal(this.newAddressP, this.permissionSheet.address)

                })
                it('emits a ChangedValidatorStorage event', async function () {

                    // have to set logs again outside of beforeEach scope
                    const { logs } = await this.sheet.setValidatorStorage(this.validatorSheet2.address, {from})

                    this.logsV = logs
                    this.eventV = this.logsV.find(l => l.event === 'ChangedValidatorStorage').event
                    this.oldAddressV = this.logsV.find(l => l.event === 'ChangedValidatorStorage').args._old
                    this.newAddressV = this.logsV.find(l => l.event === 'ChangedValidatorStorage').args._new
                    
                    assert.equal(this.logsV.length, 1)
                    assert.equal(this.eventV, "ChangedValidatorStorage")
                    assert.equal(this.oldAddressV, this.validatorSheet.address)
                    assert.equal(this.newAddressV, this.validatorSheet2.address)
                })
                it('cannot set new storages to point to old storage', async function () {
                    await expectRevert(this.sheet.setPermissionStorage(this.permissionSheet.address))
                    await expectRevert(this.sheet.setValidatorStorage(this.validatorSheet.address))
                })
                it('cannot set storages to addresses that are not contracts', async function () {
                    await expectRevert(this.sheet.setPermissionStorage(ZERO_ADDRESS))
                    await expectRevert(this.sheet.setPermissionStorage(owner))
                    await expectRevert(this.sheet.setPermissionStorage(RANDOM_ADDRESS))

                    await expectRevert(this.sheet.setValidatorStorage(ZERO_ADDRESS))
                    await expectRevert(this.sheet.setValidatorStorage(owner))
                    await expectRevert(this.sheet.setValidatorStorage(RANDOM_ADDRESS))
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

                    await this.sheet.addPermission(await this.permissionSheet.MINT_SIG(), '','','', {from:owner})
                    await this.sheet.setMinter(owner, { from:owner })
                    assert(await this.sheet.isMinter(owner))

                    await this.sheet.addPermission(await this.permissionSheet.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG(), '','','', {from:owner})
                    await this.sheet.setBlacklistSpender(owner, { from:owner })
                    assert(await this.sheet.isBlacklistSpender(owner))

                    await this.sheet.addPermission(await this.permissionSheet.DESTROY_BLACKLISTED_TOKENS_SIG(), '','','', {from:owner})
                    await this.sheet.setBlacklistDestroyer(owner, { from:owner })
                    assert(await this.sheet.isBlacklistDestroyer(owner))

                    await this.sheet.addPermission(await this.permissionSheet.BLACKLISTED_SIG(), '','','', {from:owner})
                    await this.sheet.addPermission(await this.permissionSheet.BURN_SIG(), '','','', {from:owner})
                    await this.sheet.setWhitelistedUser(owner, { from:owner })
                    assert(await this.sheet.isWhitelistedUser(owner))
                    await this.sheet.setNonlistedUser(owner, { from:owner })
                    assert(await this.sheet.isNonlistedUser(owner))
                    await this.sheet.setBlacklistedUser(owner, { from:owner })
                    assert(await this.sheet.isBlacklistedUser(owner))
                })

                describe("When Regulator replaces storage, new data is reflected", function () {

                    it('old storage has no validator', async function () {
                        assert(!(await this.sheet.isValidator(validator)));
                    })

                    describe('replacing validator storage to one with a validator', function () {
                        beforeEach(async function () {
                            await this.sheet.setValidatorStorage(this.validatorSheet2.address, {from})
                            await this.validatorSheet2.transferOwnership(this.sheet.address, {from})
                            await this.sheet.claimValidatorOwnership()
                            await this.sheet.addValidator(validator, {from})
                        })
                        it('new sheet has the validator', async function () {

                            assert(await this.sheet.isValidator(validator))

                        })
                    })
                })
            })
            describe('non-owner calls', function () {
                const from = validator
                it('reverts', async function () {
                    await expectRevert(this.sheet.setPermissionStorage(this.permissionSheet.address, {from}))
                    await expectRevert(this.sheet.setValidatorStorage(this.validatorSheet.address, {from}))

                })
            })

        })
    })
}

module.exports = {
    regulatorMutableStorageTests
}