const {
    PermissionsStorageMock,
    ValidatorStorageMock,
    expectRevert
} = require('../helpers/common');

function regulatorPermissionsTests(owner, user, validator) {

    describe("REGULATOR USER PERMISSION SETTING/GETTING", async function () {
        beforeEach(async function() {
            this.testPermissionsStorage = await PermissionsStorageMock.new({ from:owner });
            this.testValidatorStorage = await ValidatorStorageMock.new(validator, { from:owner });
            
            this.testPermission = await this.testPermissionsStorage.MINT_SIG();
            await this.testPermissionsStorage.setUserPermission(owner, this.testPermission, { from:owner});

            await this.testValidatorStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.testPermissionsStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from:owner });
            await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from:owner });
            await this.sheet.claimStorageOwnership({ from:owner });
        });

        describe('setUserPermission', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it("adds permission for user", async function () {
                    await this.sheet.setUserPermission(user, this.testPermission, { from });
                    assert(await this.sheet.hasUserPermission(user, this.testPermission));
                })
            });
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setUserPermission(user, this.testPermission, { from }));
                })
            });
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setUserPermission(user, this.testPermission, { from }));
                })
            });
        })

        describe('removeUserPermission', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('removes user permission', async function () {
                    await this.sheet.removeUserPermission(user, this.testPermission, { from });
                    assert(!(await this.sheet.hasUserPermission(user, this.testPermission)));
                })
            });
            describe("when sender is not validator but is owner", function () {
                it('reverts all calls if sender is owner', async function () {
                    await expectRevert(this.sheet.removeUserPermission(user, this.testPermission, { from: owner }));
                })
                it('reverts all calls if sender is not owner', async function () {
                    await expectRevert(this.sheet.removeUserPermission(user, this.testPermission, { from: user }));
                })
            });
        })

        describe('hasUserPermission', function () {
            const from = validator;
            it('reports if user has permission, correctly', async function () {
                await this.sheet.setUserPermission(user, this.testPermission, { from });
                assert(await this.sheet.hasUserPermission(user, this.testPermission));
            })
            it('reports if user doesn\'t have permission, correctly', async function () {
                await this.sheet.removeUserPermission(user, this.testPermission, { from });
                assert(!(await this.sheet.hasUserPermission(user, this.testPermission)));
            })
        })

        describe('setMinter', function () {
            describe("when sender is validator", function () {
                const from = validator;
                it('sets user as minter', async function () {
                    this.sheet.setMinter(user, { from });
                    assert(await this.sheet.hasUserPermission(user, this.MINT_SIG));
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
                    assert(!(await this.sheet.hasUserPermission(user, this.MINT_SIG)));
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
                    assert(await this.sheet.hasUserPermission(user, this.DESTROY_BLACKLISTED_TOKENS_SIG));
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
                    assert(!(await this.sheet.hasUserPermission(user, this.DESTROY_BLACKLISTED_TOKENS_SIG)));
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
                    assert(await this.sheet.hasUserPermission(user, this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG));
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
                    assert(!(await this.sheet.hasUserPermission(user, this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG)));
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
                    assert(await this.sheet.hasUserPermission(user, this.BURN_SIG));
                    assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));
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
                    assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                    assert(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG));
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
                    assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                    assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
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