function whitelistedTokenTests() {
    describe('mint', function () {
        describe('user has mint CUSD permission', function () {
            it('appropriate number of funds end up in Carbon\'s WT0 escrow account', function () {
                await this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: minter });
                assertBalance(this.token, this.token.cusdAddress(), 100*10**18);
            });
            it('user has appropriate amount of CUSD', function () {
                await this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: minter });
                assertBalance(this.carbonToken, whitelisted, 100 * 10 ** 18);
            });
        });
        describe('user does not have mint CUSD permission', function () {
            it('call reverts', function () {
                await expectRevert(this.token.mint(whitelisted, 100 * 10 ** 18, true, { from: whitelisted }));
            });
        });
    });
}

module.exports = {
    whitelistedTokenTests
}