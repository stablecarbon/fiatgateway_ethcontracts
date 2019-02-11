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
                this.BLACKLISTED_SIG = await this.sheet.BLACKLISTED_SIG();
                
                // Assert pre-test invariants
                assert(await this.sheet.isValidator(owner));
                assert(await this.sheet.isPermission(this.MINT_SIG));
                assert(await this.sheet.isPermission(this.DESTROY_BLACKLISTED_TOKENS_SIG));
                assert(await this.sheet.isPermission(this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG));
                assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));

            });

            describe('setMinter', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('sets user as minter', async function () {
                        await this.sheet.setMinter(user, { from });
                        assert(await this.sheet.isMinter(user));
                        assert(await this.sheet.hasUserPermission(user, this.MINT_SIG));

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
                        assert(!(await this.sheet.isMinter(user)));
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
                        assert(await this.sheet.hasUserPermission(user, this.DESTROY_BLACKLISTED_TOKENS_SIG));
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
                        assert(!(await this.sheet.hasUserPermission(user, this.DESTROY_BLACKLISTED_TOKENS_SIG)));
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
                        assert(await this.sheet.hasUserPermission(user, this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG));
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
                        assert(!(await this.sheet.hasUserPermission(user, this.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG)));
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

            describe('setBlacklistedUser', function () {
                describe("when sender is validator", function () {
                    const from = owner;
                    it('adds \'blacklisted\' user', async function () {
                        await this.sheet.setBlacklistedUser(user, { from });
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

        })

    })

}

module.exports = {
    regulatorUserPermissionsTests
}