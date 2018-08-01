const { CommonVariables, expectRevert, assertBalance } = require('../../helpers/common');
const { tokenSetup } = require('../../helpers/tokenSetup');
const { PermissionSheet, Regulator } = require('../../helpers/artifacts');
var BigNumber = require("bignumber.js");

contract('WhitelistedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const minter = commonVars.user
    const validator = commonVars.validator
    const blacklisted = commonVars.attacker
    const whitelisted = commonVars.user2
    const nonlisted = commonVars.user3
    const user = commonVars.validator2

    beforeEach(async function () {
        await tokenSetup.call(this, validator, minter, user, owner, whitelisted, blacklisted, nonlisted);
        this.token = this.wtToken;
    });

    describe("Whitelisted token tests", function () {
        const hundred = new BigNumber("100000000000000000000") // 100 * 10**18
        const fifty = new BigNumber("50000000000000000000") // 50 * 10**18
        describe('mintCUSD', function () {       
            describe('user has mint CUSD permission', function () {
                beforeEach(async function () {
                    await this.cdToken.listToken(this.token.address, { from: owner });
                    await this.token.mintCUSD(whitelisted, hundred, { from: minter });
                });
                it('appropriate number of funds end up in Carbon\'s WT0 escrow account', async function () {
                    assertBalance(this.token, await this.token.cusdAddress(), hundred);
                });
                it('user has appropriate amount of CUSD', async function () {
                    assertBalance(this.cdToken, whitelisted, hundred);
                });
            });
            describe('user does not have mint CUSD permission', function () {
                it('call reverts', async function () {
                    await expectRevert(this.token.mintCUSD(whitelisted, hundred, { from: whitelisted }));
                });
            });
        });
        describe('convert', function () {
            describe('user has conversion permission', function () {
                describe('user has sufficient funds', function () {
                    beforeEach(async function () {
                        await this.cdToken.listToken(this.token.address, { from: owner });
                        await this.token.mint(whitelisted, hundred, { from: minter });
                        await this.token.convertWT(fifty, { from: whitelisted });
                    });
                    it('user loses WT0', async function () {
                        assertBalance(this.token, whitelisted, fifty);
                    });
                    it('user gains CUSD', async function () {
                        assertBalance(this.cdToken, whitelisted, fifty);
                    });
                    it('Carbon gains WT0 in escrow', async function () {
                        assertBalance(this.token, await this.token.cusdAddress(), fifty);
                    });
                    it('Burned to CUSD event is emitted', async function () {
                        const { logs } = await this.token.convertWT(fifty, { from: whitelisted });
                        assert.equal(logs.length, 8); // Lots of events are emitted!
                        assert.equal(logs[7].event, 'ConvertedToCUSD');
                        assert.equal(logs[7].args.user, whitelisted);
                        assert(logs[7].args.amount.eq(fifty));
                    });
                });
                describe('user has insufficient funds', function () {
                    it('reverts', async function () {
                        await this.token.mint(whitelisted, hundred, { from: minter });
                        await expectRevert(this.token.convertWT(hundred.plus(1), { from: whitelisted }));
                    });
                });
            });
            describe('user does not have conversion permission', function () {
                it('call reverts', async function () {
                    await this.token.mint(whitelisted, hundred, { from: minter });
                    await expectRevert(this.token.convertWT(fifty, { from: nonlisted }));
                });
            });
        });
    });
})