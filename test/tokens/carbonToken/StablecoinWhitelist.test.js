const {
    CommonVariables,
    expectRevert,
    StablecoinWhitelist,
} = require('../helpers/common');

contract('StablecoinWhitelist', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const account2 = commonVars.userSender;

    beforeEach(async function () {
        this.sheet = await StablecoinWhitelist.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('addStablecoin', function () {
            it("adds the stablecoin to the whitelist", async function () {
                await this.sheet.addStablecoin(stablecoinAddress, { from });
                assert(await this.sheet.isWhitelisted(stablecoinAddress));
            })
            it("emits a permission added event", async function () {
                const { logs } = await this.sheet.addStablecoin(stablecoinAddress, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'StablecoinAdded');
                assert.equal(logs[0].args.stablecoin, stablecoinAddress);
            })
        })

        describe('removeStablecoin', function () {
            it("removes the stablecoin from the whitelist", async function () {
                await this.sheet.removeStablecoin(stablecoinAddress, { from });
                assert(!(await this.sheet.isWhitelisted(stablecoinAddress)));
            })
            it("emits a permission added event", async function () {
                const { logs } = await this.sheet.removeStablecoin(stablecoinAddress, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'StablecoinRemoved');
                assert.equal(logs[0].args.stablecoin, stablecoinAddress);
            })
        })
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addStablecoin(stablecoinAddress, { from }));
            await expectRevert(this.sheet.removeStablecoin(stablecoinAddress, { from }));
        })
    })
})