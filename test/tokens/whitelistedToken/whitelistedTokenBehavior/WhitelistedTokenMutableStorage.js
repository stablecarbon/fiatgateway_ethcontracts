const { expectRevert, ZERO_ADDRESS, RANDOM_ADDRESS } = require("../../../helpers/common");
const { CarbonDollar } = require("../../../helpers/artifacts")

function whitelistedTokenMutableStorageTests(owner, nonOwner) {
    describe("Whitelisted Token Storage setting/getting tests", function () {

        beforeEach(async function () {
            // Initial Token storages
            this.oldCUSDAddress = await this.token.cusdAddress()
        })

        describe('setCUSDAddress', function () {

            const from = owner
            beforeEach(async function () {
                this.newCUSDAddress = (await CarbonDollar.new(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, {from})).address
            })

            describe('owner calls', function () {
                it('changes cusdAddress', async function () {
                    await this.token.setCUSDAddress(this.newCUSDAddress, { from });
                    assert.equal(await this.token.cusdAddress(), this.newCUSDAddress)
                })
                it('emits a CUSDAddressChanged event', async function () {
                    const { logs } = await this.token.setCUSDAddress(this.newCUSDAddress, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "CUSDAddressChanged")
                    assert.equal(logs[0].args.oldCUSD, this.oldCUSDAddress)
                    assert.equal(logs[0].args.newCUSD, this.newCUSDAddress)
                })

                describe('new CUSD is a non-contract address', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setCUSDAddress(owner, { from }));
                        await expectRevert(this.token.setCUSDAddress(ZERO_ADDRESS, { from }));
                    })
                })
                describe('new CUSD is same CUSD', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.setCUSDAddress(this.oldCUSDAddress, { from }));
                    })
                })
            })

            describe('non-owner calls', function () {
                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.token.setCUSDAddress(this.newCUSDAddress, { from }))
                })
            })
        })
    })
}

module.exports = {
    whitelistedTokenMutableStorageTests
}
