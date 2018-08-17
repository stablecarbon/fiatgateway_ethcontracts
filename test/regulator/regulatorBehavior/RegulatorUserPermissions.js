const { expectRevert } = require('../../helpers/common');

const { ValidatorSheetMock, PermissionSheetMock } = require('../../helpers/mocks');

const { Regulator } = require('../../helpers/artifacts');

/**
*
* @dev test Regulator ability to add Regulator-level roles
*
*/
function regulatorUserPermissionsTests(owner, user, validator) {

    describe('Regulator sets RegulatorStorage pre-loaded with all permissions', function () {

        describe("Testing Regulator ability to SET/GET user permissions", async function () {
            beforeEach(async function() {

                // Instantiate RegulatorsMock that comes pre-loaded with all function permissions and one validator
                this.permissionSheet = await PermissionSheetMock.new( {from:owner })
                this.validatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )

                this.sheet = await Regulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})

                await this.permissionSheet.transferOwnership(this.sheet.address, {from:owner})
                await this.validatorSheet.transferOwnership(this.sheet.address, {from:owner})
                await this.sheet.claimPermissionOwnership()
                await this.sheet.claimValidatorOwnership()

                // storing method signatures for testing convenience
                this.MINT_SIG = await this.permissionSheet.MINT_SIG();
                this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.permissionSheet.DESTROY_BLACKLISTED_TOKENS_SIG();
                this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.permissionSheet.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG();
                this.BURN_SIG = await this.permissionSheet.BURN_SIG();
                this.BLACKLISTED_SIG = await this.permissionSheet.BLACKLISTED_SIG();
                
                // Assert pre-test invariants
                assert(await this.sheet.isValidator(validator));
                assert(await this.sheet.isPermission(this.MINT_SIG));
                assert(await this.sheet.isPermission(this.DESTROY_BLACKLISTED_TOKENS_SIG));
                assert(await this.sheet.isPermission(this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG));
                assert(await this.sheet.isPermission(this.BURN_SIG));
                assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));

            });

            describe('setMinter', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('sets user as minter', async function () {
                        await this.sheet.setMinter(user, { from });
                        assert(await this.sheet.isMinter(user));
                    })
                    it('emits a SetMinter event', async function () {
                        const { logs } = await this.sheet.setMinter(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetMinter');
                        assert.equal(logs[0].args.who, user);
                    })
                })
                describe("when sender is not validator but is owner", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setMinter(user, { from }));
                    })
                })

            })

            describe('removeMinter', function () {

                beforeEach(async function () {
                    const from = validator; 
                    await this.sheet.setMinter(user, { from });
                    assert(await this.sheet.isMinter(user));
                })

                describe("when sender is validator", function () {
                    const from = validator;
                    it('removes minter', async function () {
                        await this.sheet.removeMinter(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.MINT_SIG)));
                    })
                    it('emits a RemovedMinter event', async function () {
                        const { logs } = await this.sheet.removeMinter(user, { from })
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'RemovedMinter')
                        assert.equal(logs[0].args.who, user)
                    })
                })

                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeMinter(user, { from }));
                    })
                })
            })

            describe('setBlacklistDestroyer', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('sets user as blacklist destroyer', async function () {
                        await this.sheet.setBlacklistDestroyer(user, { from });
                        assert(await this.sheet.isBlacklistDestroyer(user));
                    })
                    it('emits a SetBlacklistDestroyer event', async function () {
                        const { logs } = await this.sheet.setBlacklistDestroyer(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetBlacklistDestroyer');
                        assert.equal(logs[0].args.who, user);
                    })
                })
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistDestroyer(user, { from }));
                    })
                })
            })

            describe('removeBlacklistDestroyer', function () {
                
                beforeEach(async function () {
                    const from = validator;
                    await this.sheet.setBlacklistDestroyer(user, { from });
                    assert(await this.sheet.isBlacklistDestroyer(user));
                })
                describe("when sender is validator", function () {
                    const from = validator;
                    it('removes blacklist destroyer', async function () {
                        await this.sheet.removeBlacklistDestroyer(user, { from });
                        assert(!(await this.sheet.isBlacklistDestroyer(user)));
                    })
                    it('emits a RemovedBlacklistDestroyer event', async function () {
                        const { logs } = await this.sheet.removeBlacklistDestroyer(user, {from})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'RemovedBlacklistDestroyer')
                        assert.equal(logs[0].args.who, user)
                    })
                })
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeBlacklistDestroyer(user, { from }));
                    })
                })
            })

            describe('setBlacklistSpender', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('sets user as blacklist spender', async function () {
                        await this.sheet.setBlacklistSpender(user, { from });
                        assert(await this.sheet.isBlacklistSpender(user));
                    })
                    it('emits a SetBlacklistSpender event', async function () {
                        const { logs } = await this.sheet.setBlacklistSpender(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetBlacklistSpender');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistSpender(user, { from }));
                    })
                });
            })

            describe('removeBlacklistSpender', function () {

                beforeEach(async function () {
                    const from = validator;
                    await this.sheet.setBlacklistSpender(user, { from });
                    assert(await this.sheet.isBlacklistSpender(user));
                })
                describe("when sender is validator", function () {
                    const from = validator;
                    it('removes blacklist spender', async function () {
                        await this.sheet.removeBlacklistSpender(user, { from });
                        assert(!(await this.sheet.isBlacklistSpender(user)));
                    })
                    it('emits a RemovedBlacklistSpender event', async function () {
                        const { logs } = await this.sheet.removeBlacklistSpender(user, {from})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'RemovedBlacklistSpender')
                        assert.equal(logs[0].args.who, user)
                    })
                });
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeBlacklistSpender(user, { from }));
                    })
                });
            })

            describe('setWhitelistedUser', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('adds \'whitelisted\' user', async function () {
                        await this.sheet.setWhitelistedUser(user, { from });
                        assert(await this.sheet.hasUserPermission(user, this.BURN_SIG));
                        assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));

                    })
                    it('emits a SetWhitelistedUser event', async function () {
                        const { logs } = await this.sheet.setWhitelistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetWhitelistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setWhitelistedUser(user, { from }));
                    })
                });
            })

            describe('setBlacklistedUser', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('adds \'blacklisted\' user', async function () {
                        await this.sheet.setBlacklistedUser(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                        assert(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG));

                    })
                    it('emits a SetBlacklistedUser event', async function () {
                        const { logs } = await this.sheet.setBlacklistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetBlacklistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistedUser(user, { from }));
                    })
                });
            })

            describe('setNonlistedUser', function () {
                describe("when sender is validator", function () {
                    const from = validator;
                    it('adds \'nonlisted\' user', async function () {
                        await this.sheet.setNonlistedUser(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                        assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));

                    })
                    it('emits a SetNonlistedUser event', async function () {
                        const { logs } = await this.sheet.setNonlistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'SetNonlistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = owner;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setNonlistedUser(user, { from }));
                    })
                });
            })

            // Check that user is only one of White/Black/Non-listed at any one time
            describe('isWhitelistedUser', function () {
                const from = validator;
                beforeEach( async function () {
                    await this.sheet.setWhitelistedUser(user, { from });
                })
                it('reports if user is whitelisted, correctly', async function () {
                    assert(await this.sheet.isWhitelistedUser(user));
                })
                it('reports if user is not whitelisted, correctly', async function () {
                    await this.sheet.setNonlistedUser(user, { from });
                    assert(!(await this.sheet.isWhitelistedUser(user)));
                })
                it('reports if user is not whitelisted, correctly', async function () {
                    await this.sheet.setBlacklistedUser(user, { from });
                    assert(!(await this.sheet.isWhitelistedUser(user)));
                })
            })

            describe('isBlacklistedUser', function () {
                const from = validator;
                beforeEach( async function () {
                    await this.sheet.setBlacklistedUser(user, { from });
                })
                it('reports if user is blacklisted, correctly', async function () {
                    assert(await this.sheet.isBlacklistedUser(user));
                })
                it('reports if user is not blacklisted, correctly', async function () {
                    await this.sheet.setNonlistedUser(user, { from });
                    assert(!(await this.sheet.isBlacklistedUser(user)));
                })
                it('reports if user is not blacklisted, correctly', async function () {
                    await this.sheet.setWhitelistedUser(user, { from });
                    assert(!(await this.sheet.isBlacklistedUser(user)));
                })
            })

            describe('isNonlistedUser', function () {
                const from = validator;
                beforeEach( async function () {
                    await this.sheet.setNonlistedUser(user, { from });
                })
                it('reports if user is nonlisted, correctly', async function () {
                    await this.sheet.setNonlistedUser(user, { from });
                    assert(await this.sheet.isNonlistedUser(user));
                })
                it('reports if user is not nonlisted, correctly', async function () {
                    await this.sheet.setBlacklistedUser(user, { from });
                    assert(!(await this.sheet.isNonlistedUser(user)));
                })
                it('reports if user is not nonlisted, correctly', async function () {
                    await this.sheet.setWhitelistedUser(user, { from });
                    assert(!(await this.sheet.isNonlistedUser(user)));
                })
            })

        })

    })

}

module.exports = {
    regulatorUserPermissionsTests
}