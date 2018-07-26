const { permissionedTokenBehavior } = require('../permissionedToken/PermissionedTokenBehavior');
const { permissionedTokenStorage } = require('../permissionedToken/PermissionedTokenStorage');
const {
    WhitelistedTokenMock,
    CommonVariables
} = require('../../helpers/common');

contract('WhitelistedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    this.minter = commonVars.accounts[0];
    this.validator = commonVars.accounts[1];
    this.blacklisted = commonVars.accounts[2];
    this.whitelisted = commonVars.accounts[3];
    this.nonlisted = commonVars.accounts[4];

    describe("WhitelistedToken tests", function () {
        beforeEach(async function () {
            this.token = await WhitelistedTokenMock.new(
                this.validator,
                this.minter,
                this.whitelisted,
                this.blacklisted,
                this.nonlisted,
                { from: owner })
        });
        describe("Passes permissioned token tests",
            function () { 
                permissionedTokenTests(this.minter, this.whitelisted, this.nonlisted, this.blacklisted, this.user) 
            });
        describe("Whitelisted token tests", function () {
            describe('mint', function () {
                describe('user has mint CUSD permission', function () {
                    it('appropriate number of funds end up in Carbon\'s WT0 escrow account', async function () {
                        await this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: minter });
                        assertBalance(this.token, this.token.cusdAddress(), 100 * 10 ** 18);
                    });
                    it('user has appropriate amount of CUSD', async function () {
                        await this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: minter });
                        assertBalance(this.carbonToken, whitelisted, 100 * 10 ** 18);
                    });
                });
                describe('user does not have mint CUSD permission', function () {
                    it('call reverts', async function () {
                        await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: whitelisted }));
                    });
                });
            });
        });
    });
})