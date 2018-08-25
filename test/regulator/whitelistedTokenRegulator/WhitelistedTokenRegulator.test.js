const { CommonVariables, expectRevert } = require('../../helpers/common');

const { WhitelistedTokenRegulator } = require('../../helpers/artifacts');

const { WhitelistedRegulatorMock } = require('../../helpers/mocks');


contract('WhitelistedTokenRegulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = owner;
    const attacker = commonVars.attacker;


    describe("testing WhitelistedTokenRegulator overwritten functions", function () {
        describe('WhitelistedTokenRegulator sets WhitelistedTokenRegulatorStorage pre-loaded with all permissions', function () {

            describe("Testing WhitelistedTokenRegulator ability to SET/GET user permissions", async function () {
                beforeEach(async function() {

                    // Instantiate RegulatorsMock that comes pre-loaded with all function permissions and one validator
                    this.sheet = await WhitelistedRegulatorMock.new({from:owner})

                    // storing method signatures for testing convenience
                    this.BLACKLISTED_SIG = await this.sheet.BLACKLISTED_SIG();
                    this.CONVERT_WT_SIG = await this.sheet.CONVERT_WT_SIG();
                    this.MINT_CUSD_SIG = await this.sheet.MINT_CUSD_SIG();
                    this.MINT_SIG = await this.sheet.MINT_SIG();

                    
                    // Assert pre-test invariants
                    assert(await this.sheet.isValidator(validator));
                    assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));
                    assert(await this.sheet.isPermission(this.CONVERT_WT_SIG));
                    assert(await this.sheet.isPermission(this.MINT_CUSD_SIG));
                    assert(await this.sheet.isPermission(this.MINT_SIG));

                });

                describe('setMinter', function () {
                    describe("when sender is validator", function () {
                        const from = validator;
                        it('sets user as WT minter', async function () {
                            await this.sheet.setMinter(user, { from });
                            assert(await this.sheet.hasUserPermission(user, this.MINT_CUSD_SIG));
                            assert(await this.sheet.hasUserPermission(user, this.MINT_SIG));
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
                        const from = validator; 
                        await this.sheet.setMinter(user, { from });
                        assert(await this.sheet.isMinter(user));
                    })

                    describe("when sender is validator", function () {
                        const from = validator;
                        it('removes minter', async function () {
                            await this.sheet.removeMinter(user, { from });
                            assert(!(await this.sheet.hasUserPermission(user, this.MINT_CUSD_SIG)));
                            assert(!(await this.sheet.hasUserPermission(user, this.MINT_SIG)));
                            assert(!(await this.sheet.isMinter(user)))
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

                describe('setWhitelistedUser', function () {
                    describe("when sender is validator", function () {
                        const from = validator;
                        it('adds WT \'whitelisted\' user', async function () {
                            await this.sheet.setWhitelistedUser(user, { from });
                            assert(await this.sheet.hasUserPermission(user, this.CONVERT_WT_SIG));
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
                        const from = validator;
                        it('adds WT \'blacklisted\' user', async function () {
                            await this.sheet.setBlacklistedUser(user, { from });
                            assert(!(await this.sheet.hasUserPermission(user, this.CONVERT_WT_SIG)));
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
                        const from = validator;
                        it('adds WT \'nonlisted\' user', async function () {
                            await this.sheet.setNonlistedUser(user, { from });
                            assert(!(await this.sheet.hasUserPermission(user, this.CONVERT_WT_SIG)));
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

    })
})