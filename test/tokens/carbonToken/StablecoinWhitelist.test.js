const {
    CommonVariables,
    expectRevert,
    RANDOM_ADDRESS,
    StablecoinWhitelist,
} = require('../../helpers/common');

contract('StablecoinWhitelist', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.accounts[0];
    const account2 = commonVars.accounts[1];

    beforeEach(async function () {
        this.sheet = await StablecoinWhitelist.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('addStablecoin', function () {
            it("adds the stablecoin to the whitelist", async function () {
                await this.sheet.addStablecoin(RANDOM_ADDRESS, { from });
                assert(await this.sheet.isWhitelisted(RANDOM_ADDRESS));
            })
            it("emits a permission added event", async function () {
                const { logs } = await this.sheet.addStablecoin(RANDOM_ADDRESS, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'StablecoinAdded');
                assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
            })
        })

        describe('removeStablecoin', function () {
            it("removes the stablecoin from the whitelist", async function () {
                await this.sheet.removeStablecoin(RANDOM_ADDRESS, { from });
                assert(!(await this.sheet.isWhitelisted(RANDOM_ADDRESS)));
            })
            it("emits a permission added event", async function () {
                const { logs } = await this.sheet.removeStablecoin(RANDOM_ADDRESS, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'StablecoinRemoved');
                assert.equal(logs[0].args.stablecoin, RANDOM_ADDRESS);
            })
        })
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addStablecoin(RANDOM_ADDRESS, { from }));
            await expectRevert(this.sheet.removeStablecoin(RANDOM_ADDRESS, { from }));
        })
    })
})