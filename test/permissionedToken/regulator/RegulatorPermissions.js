const {
    PermissionStorageMock,
    ValidatorStorageMock,
    UserPermissionsStorage,
    expectRevert
} = require('../../helpers/common');

function regulatorPermissionsTests(owner, user, validator) {

    describe("REGULATOR PERMISSION SETTING/GETTING", async function () {
        beforeEach(async function() {
            this.testPermissionStorage = await PermissionStorageMock.new({ from:owner });
            this.testUserPermissionsStorage = await UserPermissionsStorage.new({ from:owner });
            this.testValidatorStorage = await ValidatorStorageMock.new(validator, { from:owner });
            
            this.testPermission = await this.testPermissionStorage.MINT();
            await this.testUserPermissionsStorage.setPermission(owner, this.testPermission, { from:owner});

            await this.testValidatorStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.testUserPermissionsStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.testPermissionStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.sheet.setPermissionStorage(this.testPermissionStorage.address, { from:owner });
            await this.sheet.setUserPermissionsStorage(this.testUserPermissionsStorage.address, { from:owner });
            await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from:owner });
            await this.sheet.claimStorageOwnership({ from:owner });
        });

        describe('setPermission', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it("adds permission for user", async function () {
                    await this.sheet.setPermission(user, this.testPermission, { from });
                    assert(await this.sheet.hasPermission(user, this.testPermission));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setPermission(user, this.testPermission, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setPermission(user, this.testPermission, { from }));
                })
            });
        })

        describe('removePermission', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('removes user permission', async function () {
                    await this.sheet.removePermission(user, this.testPermission, { from });
                    assert(!(await this.sheet.hasPermission(user, this.testPermission)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removePermission(user, this.testPermission, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removePermission(user, this.testPermission, { from }));
                })
            });
        })

        describe('hasPermission', function () {
            const from = validator;
            it('reports if user has permission, correctly', async function () {
                await this.sheet.setPermission(user, this.testPermission, { from });
                assert(await this.sheet.hasPermission(user, this.testPermission));
            })
            it('reports if user doesn\'t have permission, correctly', async function () {
                await this.sheet.removePermission(user, this.testPermission, { from });
                assert(!(await this.sheet.hasPermission(user, this.testPermission)));
            })
        })

        describe('setMinter', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('sets user as minter', async function () {
                    this.sheet.setMinter(user, { from });
                    assert(await this.sheet.hasPermission(user, this.MINT_SIG));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setMinter(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setMinter(user, { from }));
                })
            });
        })

        describe('removeMinter', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('removes minter', async function () {
                    await this.sheet.removeMinter(user, { from });
                    assert(!(await this.sheet.hasPermission(user, this.MINT_SIG)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeMinter(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeMinter(user, { from }));
                })
            });
        })

        describe('setBlacklistDestroyer', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('sets user as blacklist destroyer', async function () {
                    this.sheet.setBlacklistDestroyer(user, { from });
                    assert(await this.sheet.hasPermission(user, this.DESTROYBLACKLIST_SIG));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistDestroyer(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistDestroyer(user, { from }));
                })
            });
        })

        describe('removeBlacklistDestroyer', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('removes blacklist destroyer', async function () {
                    await this.sheet.removeBlacklistDestroyer(user, { from });
                    assert(!(await this.sheet.hasPermission(user, this.DESTROYBLACKLIST_SIG)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeBlacklistDestroyer(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeBlacklistDestroyer(user, { from }));
                })
            });
        })

        describe('setBlacklistSpender', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('sets user as blacklist spender', async function () {
                    this.sheet.setBlacklistSpender(user, { from });
                    assert(await this.sheet.hasPermission(user, this.ADD_BLACKLISTED_SPENDER_SIG));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistSpender(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistSpender(user, { from }));
                })
            });
        })

        describe('removeBlacklistSpender', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('removes blacklist spender', async function () {
                    await this.sheet.removeBlacklistSpender(user, { from });
                    assert(!(await this.sheet.hasPermission(user, this.ADD_BLACKLISTED_SPENDER_SIG)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeBlacklistSpender(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeBlacklistSpender(user, { from }));
                })
            });
        })

        describe('setWhitelistedUser', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('adds \'whitelisted\' user', async function () {
                    await this.sheet.setWhitelistedUser(user, { from });
                    assert(await this.sheet.hasPermission(user, this.BURN_SIG));
                    assert(!(await this.sheet.hasPermission(user, this.DESTROYSELF_SIG)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setWhitelistedUser(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setWhitelistedUser(user, { from }));
                })
            });
        })

        describe('setBlacklistedUser', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('adds \'blacklisted\' user', async function () {
                    await this.sheet.setBlacklistedUser(user, { from });
                    assert(!(await this.sheet.hasPermission(user, this.BURN_SIG)));
                    assert(await this.sheet.hasPermission(user, this.DESTROYSELF_SIG));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistedUser(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistedUser(user, { from }));
                })
            });
        })

        describe('setNonlistedUser', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('adds \'nonlisted\' user', async function () {
                    await this.sheet.setNonlistedUser(user, { from });
                    assert(!(await this.sheet.hasPermission(user, this.BURN_SIG)));
                    assert(!(await this.sheet.hasPermission(user, this.BURN_SIG)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setNonlistedUser(user, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setNonlistedUser(user, { from }));
                })
            });
        })

        describe('isWhitelistedUser', function () {
            const from = validator;
            it('reports if user is whitelisted, correctly', async function () {
                await this.sheet.setWhitelistedUser(user, { from });
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
            it('reports if user is blacklisted, correctly', async function () {
                await this.sheet.setBlacklistedUser(user, { from });
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

        describe('isBlacklistDestroyer', function () {
            const from = validator;
            it('reports if user is a blacklist destroyer, correctly', async function () {
                await this.sheet.setBlacklistDestroyer(user, { from });
                assert(await this.sheet.isBlacklistDestroyer(user));
            })
            it('reports if user is not a blacklist destroyer, correctly', async function () {
                await this.sheet.removeBlacklistDestroyer(user, { from });
                assert(!(await this.sheet.isBlacklistDestroyer(user)));
            })
        })

        describe('isBlacklistSpender', function () {
            const from = validator;
            it('reports if user is a blacklist spender, correctly', async function () {
                await this.sheet.setBlacklistSpender(user, { from });
                assert(await this.sheet.isBlacklistSpender(user));
            })
            it('reports if user is not a blacklist spender, correctly', async function () {
                await this.sheet.removeBlacklistSpender(user, { from });
                assert(!(await this.sheet.isBlacklistSpender(user)));
            })
        })
    })
}

module.exports = {
    regulatorPermissionsTests
}