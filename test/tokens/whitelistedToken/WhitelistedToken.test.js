const { CommonVariables, ZERO_ADDRESS, expectRevert, assertBalance } = require('../../helpers/common');
const { tokenSetup } = require('../../helpers/tokenSetup');
const { WhitelistedToken } = require('../../helpers/artifacts');
const { whitelistedTokenMutableStorageTests } = require('./whitelistedTokenBehavior/WhitelistedTokenMutableStorage.js')

var BigNumber = require("bignumber.js");

contract('WhitelistedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const minter = commonVars.user
    const validator = commonVars.validator
    const blacklisted = commonVars.attacker
    const anotherUser = commonVars.user3
    const user = commonVars.validator2

    beforeEach(async function () {
        await tokenSetup.call(this, validator, minter, user, owner, blacklisted, anotherUser);
        this.token = this.wtToken;
    });

    describe("Whitelisted token behavior tests", function () {
        const hundred = new BigNumber("100000000000000000000") // 100 * 10**18
        const fifty = new BigNumber("50000000000000000000") // 50 * 10**18
        describe('mintCUSD', function () {    
            describe('user has mint CUSD permission', function () {
                const from = minter
                beforeEach(async function () {
                    await this.cdToken.listToken(this.token.address, { from: owner });
                });
                describe('receiver is blacklisted', function () {
                    const to = blacklisted

                    it('reverts', async function () {
                        await expectRevert(this.token.mintCUSD(to, hundred, { from }))
                    })
                })
                describe('receiver is not blacklisted', function () {
                    const to = user

                    it('appropriate number of funds end up in Carbon\'s WT0 escrow account', async function () {
                        await this.token.mintCUSD(to, hundred, { from });
                        assertBalance(this.token, await this.token.cusdAddress(), hundred);
                    });
                    it('user has appropriate amount of CUSD', async function () {
                        await this.token.mintCUSD(to, hundred, { from });
                        assertBalance(this.cdToken, to, hundred);
                    });
                    it('reverts when paused', async function () {
                        await this.token.pause({ from: owner })
                        await expectRevert(this.token.mintCUSD(to, hundred, { from }))
                    })
                })
            });
            describe('user does not have mint CUSD permission', function () {
                const from = anotherUser
                const to = user
                it('call reverts', async function () {
                    await expectRevert(this.token.mintCUSD(to, hundred, { from }));
                });
            });
            describe('minting to CarbonUSD contract address', function () {
                it('should fail', async function () {
                    await expectRevert(this.token.mintCUSD(this.cdToken.address, hundred, { from: minter }));
                });
            });
        });
        describe('convert', function () {
            describe('user is not blacklisted', function () {
                const from = user

                describe('user has sufficient funds', function () {
                    beforeEach(async function () {
                        await this.cdToken.listToken(this.token.address, { from: owner });
                        await this.token.mint(from, hundred, { from: minter });
                    });
                    it('user loses WT0', async function () {
                        await this.token.convertWT(fifty, { from });
                        assertBalance(this.token, from, fifty);
                    });
                    it('user gains CUSD', async function () {
                        await this.token.convertWT(fifty, { from });
                        assertBalance(this.cdToken, from, fifty);
                    });
                    it('Carbon gains WT0 in escrow', async function () {
                        await this.token.convertWT(fifty, { from });
                        assertBalance(this.token, await this.token.cusdAddress(), fifty);
                    });
                    it('Burned to CUSD event is emitted', async function () {
                        const { logs } = await this.token.convertWT(fifty, { from });
                        assert.equal(logs.length, 8); // Lots of events are emitted!
                        assert.equal(logs[7].event, 'ConvertedToCUSD');
                        assert.equal(logs[7].args.user, from);
                        assert(logs[7].args.amount.eq(fifty));
                    });
                    it('reverts when paused', async function () {
                        await this.token.pause({ from:owner })
                        await expectRevert(this.token.convertWT(fifty, { from }))
                    })
                });
                describe('user has insufficient funds', function () {
                    it('reverts', async function () {
                        await this.token.mint(from, hundred, { from: minter });
                        await expectRevert(this.token.convertWT(hundred.plus(1), { from }));
                    });
                });
            });
            describe('user is blacklisted', function () {
                const from = blacklisted

                it('call reverts', async function () {
                    await this.regulator.removeBlacklistedUser(from, { from: validator })
                    await this.token.mint(from, hundred, { from: minter });
                    await this.regulator.setBlacklistedUser(from, { from: validator })
                    await expectRevert(this.token.convertWT(fifty, { from }));
                });
            });
        });
    });

    describe("Whitelisted token storage interaction tests", function () {
        whitelistedTokenMutableStorageTests(owner, user)
    });
})