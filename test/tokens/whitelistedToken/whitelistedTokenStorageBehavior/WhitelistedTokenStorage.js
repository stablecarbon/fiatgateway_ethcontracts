const { ZERO_ADDRESS, expectRevert, RANDOM_ADDRESS } = require('../../../helpers/common');
const { WhitelistedTokenStorage } = require('../../../helpers/artifacts');

function whitelistedTokenStorageTests(owner, user) {

    describe('WhitelistedTokenStorage behavior tests', function () {
        describe("constructor tests", function () {
            describe("cusdAddress provided", function() {
                it("sets cusdAddress to ZERO_ADDRESS", async function() {
                    const newStorage = await WhitelistedTokenStorage.new(ZERO_ADDRESS, {from: owner});
                    assert.equal(await newStorage.cusdAddress(), ZERO_ADDRESS);
                })
                it("sets cusdAddress to RANDOM_ADDRESS", async function () {
                    const newStorage = await WhitelistedTokenStorage.new(RANDOM_ADDRESS, {from: owner});
                    assert.equal(await newStorage.cusdAddress(), RANDOM_ADDRESS);
                })
            })

        })

    })
}

module.exports = {
    whitelistedTokenStorageTests
}