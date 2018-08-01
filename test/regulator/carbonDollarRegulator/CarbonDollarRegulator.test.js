const { CommonVariables, expectRevert } = require('../../helpers/common');

const { CarbonDollarRegulator } = require('../../helpers/artifacts');

const { ValidatorSheetMock, PermissionSheetMock } = require('../../helpers/mocks');


contract('CarbonDollarRegulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const validator = commonVars.validator;
    const attacker = commonVars.attacker;


    describe("testing CarbonDollarRegulator overwritten functions", function () {
        describe('CarbonDollarRegulator sets CarbonDollarRegulatorStorage pre-loaded with all permissions', function () {

            describe("Testing CarbonDollarRegulator ability to SET/GET user permissions", async function () {
                beforeEach(async function() {

                    // Instantiate RegulatorsMock that comes pre-loaded with all function permissions and one validator
                    this.permissionSheet = await PermissionSheetMock.new( {from:owner })
                    this.validatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )

                    this.sheet = await CarbonDollarRegulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})

                    await this.permissionSheet.transferOwnership(this.sheet.address, {from:owner})
                    await this.validatorSheet.transferOwnership(this.sheet.address, {from:owner})

                    // storing method signatures for testing convenience
                    this.BLACKLISTED_SIG = await this.permissionSheet.BLACKLISTED_SIG();
                    this.CONVERT_CARBON_DOLLAR_SIG = await this.permissionSheet.CONVERT_CARBON_DOLLAR_SIG();
                    
                    // Assert pre-test invariants
                    assert(await this.sheet.isValidator(validator));
                    assert(await this.sheet.isPermission(this.BLACKLISTED_SIG));
                    assert(await this.sheet.isPermission(this.CONVERT_CARBON_DOLLAR_SIG));

                });

                describe('setWhitelistedUser', function () {
                    describe("when sender is validator", function () {
                        const from = validator;
                        it('adds CarbonDollar \'whitelisted\' user', async function () {
                            await this.sheet.setWhitelistedUser(user, { from });
                            assert(await this.sheet.hasUserPermission(user, this.CONVERT_CARBON_DOLLAR_SIG));
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
                            assert(!(await this.sheet.hasUserPermission(user, this.CONVERT_CARBON_DOLLAR_SIG)));
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
                            assert(!(await this.sheet.hasUserPermission(user, this.CONVERT_CARBON_DOLLAR_SIG)));
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

    })
})