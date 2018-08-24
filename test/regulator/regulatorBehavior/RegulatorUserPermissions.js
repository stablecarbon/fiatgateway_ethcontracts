const { expectRevert } = require('../../helpers/common');

const { RegulatorMock } = require('../../helpers/mocks');

/**
*
* @dev test Regulator ability to add Regulator-level roles
*
*/
function regulatorUserPermissionsTests(owner, user) {

    describe('Regulator sets RegulatorStorage pre-loaded with all permissions', function () {

        describe("Testing Regulator ability to SET/GET user permissions", async function () {
            beforeEach(async function() {

                // Instantiate RegulatorsMock that comes pre-loaded with all function permissions and one validator

                this.sheet = await RegulatorMock.new({from:owner})

                // storing method signatures for testing convenience
                this.MINT_SIG = await this.sheet.MINT_SIG();
                this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.sheet.DESTROY_BLACKLISTED_TOKENS_SIG();
                this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.sheet.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG();
                this.BURN_SIG = await this.sheet.BURN_SIG();
                this.BLACKLISTED_SIG = await this.sheet.BLACKLISTED_SIG();
                
                // Assert pre-test invariants
                assert(await this.sheet.isValidator(owner));
                assert(await this.sheet.isPermission(this.MINT_SIG));
                assert(await this.sheet.isPermission(this.DESTROY_BLACKLISTED_TOKENS_SIG));
                assert(await this.sheet.isPermission(this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG));
                assert(await this.sheet.isPermission(this.BURN_SIG));
                assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));

            });

            describe('setMinter', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('sets user as minter', async function () {
                        await this.sheet.setMinter(user, { from });
                        assert(await this.sheet.isMinter(user));
                    })
                    it('emits a LogSetMinter event', async function () {
                        const { logs } = await this.sheet.setMinter(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogSetMinter');
                        assert.equal(logs[0].args.who, user);
                    })
                })
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setMinter(user, { from }));
                    })
                })

            })

            describe('removeMinter', function () {

                beforeEach(async function () {
                    const from = owner; 
                    await this.sheet.setMinter(user, { from });
                    assert(await this.sheet.isMinter(user));
                })

                describe("when sender is validator", function () {
                    const from = owner;
                    it('removes minter', async function () {
                        await this.sheet.removeMinter(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.MINT_SIG)));
                    })
                    it('emits a LogRemovedMinter event', async function () {
                        const { logs } = await this.sheet.removeMinter(user, { from })
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'LogRemovedMinter')
                        assert.equal(logs[0].args.who, user)
                    })
                })

                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeMinter(user, { from }));
                    })
                })
            })

            describe('setBlacklistDestroyer', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('sets user as blacklist destroyer', async function () {
                        await this.sheet.setBlacklistDestroyer(user, { from });
                        assert(await this.sheet.isBlacklistDestroyer(user));
                    })
                    it('emits a LogSetBlacklistDestroyer event', async function () {
                        const { logs } = await this.sheet.setBlacklistDestroyer(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogSetBlacklistDestroyer');
                        assert.equal(logs[0].args.who, user);
                    })
                })
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistDestroyer(user, { from }));
                    })
                })
            })

            describe('removeBlacklistDestroyer', function () {
                
                beforeEach(async function () {
                    const from = owner;
                    await this.sheet.setBlacklistDestroyer(user, { from });
                    assert(await this.sheet.isBlacklistDestroyer(user));
                })
                describe("when sender is validator", function () {
                    const from = owner;
                    it('removes blacklist destroyer', async function () {
                        await this.sheet.removeBlacklistDestroyer(user, { from });
                        assert(!(await this.sheet.isBlacklistDestroyer(user)));
                    })
                    it('emits a LogRemovedBlacklistDestroyer event', async function () {
                        const { logs } = await this.sheet.removeBlacklistDestroyer(user, {from})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'LogRemovedBlacklistDestroyer')
                        assert.equal(logs[0].args.who, user)
                    })
                })
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeBlacklistDestroyer(user, { from }));
                    })
                })
            })

            describe('setBlacklistSpender', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('sets user as blacklist spender', async function () {
                        await this.sheet.setBlacklistSpender(user, { from });
                        assert(await this.sheet.isBlacklistSpender(user));
                    })
                    it('emits a LogSetBlacklistSpender event', async function () {
                        const { logs } = await this.sheet.setBlacklistSpender(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogSetBlacklistSpender');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistSpender(user, { from }));
                    })
                });
            })

            describe('removeBlacklistSpender', function () {

                beforeEach(async function () {
                    const from = owner;
                    await this.sheet.setBlacklistSpender(user, { from });
                    assert(await this.sheet.isBlacklistSpender(user));
                })
                describe("when sender is validator", function () {
                    const from = owner;
                    it('removes blacklist spender', async function () {
                        await this.sheet.removeBlacklistSpender(user, { from });
                        assert(!(await this.sheet.isBlacklistSpender(user)));
                    })
                    it('emits a LogRemovedBlacklistSpender event', async function () {
                        const { logs } = await this.sheet.removeBlacklistSpender(user, {from})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'LogRemovedBlacklistSpender')
                        assert.equal(logs[0].args.who, user)
                    })
                });
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.removeBlacklistSpender(user, { from }));
                    })
                });
            })

            describe('setWhitelistedUser', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('adds \'whitelisted\' user', async function () {
                        await this.sheet.setWhitelistedUser(user, { from });
                        assert(await this.sheet.hasUserPermission(user, this.BURN_SIG));
                        assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));

                    })
                    it('emits a LogWhitelistedUser event', async function () {
                        const { logs } = await this.sheet.setWhitelistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogWhitelistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setWhitelistedUser(user, { from }));
                    })
                });
            })

            describe('setBlacklistedUser', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('adds \'blacklisted\' user', async function () {
                        await this.sheet.setBlacklistedUser(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                        assert(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG));

                    })
                    it('emits a LogBlacklistedUser event', async function () {
                        const { logs } = await this.sheet.setBlacklistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogBlacklistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setBlacklistedUser(user, { from }));
                    })
                });
            })

            describe('setNonlistedUser', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('adds \'nonlisted\' user', async function () {
                        await this.sheet.setNonlistedUser(user, { from });
                        assert(!(await this.sheet.hasUserPermission(user, this.BURN_SIG)));
                        assert(!(await this.sheet.hasUserPermission(user, this.BLACKLISTED_SIG)));

                    })
                    it('emits a LogNonlistedUser event', async function () {
                        const { logs } = await this.sheet.setNonlistedUser(user, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'LogNonlistedUser');
                        assert.equal(logs[0].args.who, user);
                    })
                });
                describe("when sender is not validator", function () {
                    const from = user;
                    it('reverts', async function () {
                        await expectRevert(this.sheet.setNonlistedUser(user, { from }));
                    })
                });
            })

            // Check that user is only one of White/Black/Non-listed at any one time
            describe('isWhitelistedUser', function () {
                const from = owner;
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
                const from = owner;
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
                const from = owner;
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