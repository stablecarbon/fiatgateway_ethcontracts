const { expectRevert } = require('../helpers/common');

const { PermissionsStorageMock, ValidatorStorageMock } = require('../helpers/mocks');

function regulatorPermissionsTests(owner, user, validator) {

    describe("Regulator user permissions setting and getting", async function () {
        beforeEach(async function() {

            // Instantiate PermissionsStorage with function permissions and ValidatorStorage with one validator
            this.testPermissionsStorage = await PermissionsStorageMock.new({ from:owner });
            this.testValidatorStorage = await ValidatorStorageMock.new(validator, { from:owner });

            // storing method signatures for testing convenience
            this.MINT_SIG = await this.testPermissionsStorage.MINT_SIG();
            this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.testPermissionsStorage.DESTROY_BLACKLISTED_TOKENS_SIG();
            this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.testPermissionsStorage.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
            this.BURN_SIG = await this.testPermissionsStorage.BURN_SIG();
            this.BLACKLISTED_SIG = await this.testPermissionsStorage.BLACKLISTED_SIG();
            
            // Make Regulator the owner of the storage contracts 
            await this.testValidatorStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.testPermissionsStorage.transferOwnership(this.sheet.address, { from:owner });
            await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from:owner });
            await this.sheet.setValidatorStorage(this.testValidatorStorage.address, { from:owner });
            await this.sheet.claimStorageOwnership({ from:owner });

        });

        describe("assert permission invariants", function () {
            // Assert invariants
            assert(await this.sheet.isValidator(validator));
            assert(await this.sheet.isPermission(this.MINT_SIG));
            assert(await this.sheet.isPermission(this.DESTROY_BLACKLISTED_TOKENS_SIG));
            assert(await this.sheet.isPermission(this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG));
            assert(await this.sheet.isPermission(this.BURN_SIG));
            assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));
        })

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
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setMinter(user, { from }));
                })
            })
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
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
                    const { logs } = await this.sheet.removeMinter(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'RemovedMinter');
                    assert.equal(logs[0].args.who, user);
                })
            })

            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeMinter(user, { from }));
                })
            })

            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
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
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.setBlacklistDestroyer(user, { from }));
                })
            })
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
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
                    const { logs } = await this.sheet.removeBlacklistDestroyer(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'RemovedBlacklistDestroyer');
                    assert.equal(logs[0].args.who, user);
                })
            })
            describe("when sender is not validator but is owner", function () {
                const from = owner;
                it('reverts all calls', async function () {
                    await expectRevert(this.sheet.removeBlacklistDestroyer(user, { from }));
                })
            })
            describe("when sender is not validator and is not owner", function () {
                const from = user;
                it('reverts all calls', async function () {
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
                it('emits a SetBlackListSpender event', async function () {
                    const { logs } = await this.sheet.setBlacklistSpender(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetBlacklistSpender');
                    assert.equal(logs[0].args.who, user);
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
                    const { logs } = await this.sheet.removeBlacklistSpender(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'RemovedBlacklistSpender');
                    assert.equal(logs[0].args.who, user);
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
                it('emits a SetWhitelistedUser event', async function () {
                    const { logs } = await this.sheet.setWhitelistedUser(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetWhitelistedUser');
                    assert.equal(logs[0].args.who, user);
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
                it('emits a SetBlacklistedUser event', async function () {
                    const { logs } = await this.sheet.setBlacklistedUser(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetBlacklistedUser');
                    assert.equal(logs[0].args.who, user);
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
                    assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));

                })
                it('emits a SetNonlistedUser event', async function () {
                    const { logs } = await this.sheet.setNonlistedUser(user, { from });
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'SetNonlistedUser');
                    assert.equal(logs[0].args.who, user);
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
}

module.exports = {
    regulatorPermissionsTests
}