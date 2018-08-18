const AddressVerification = artifacts.require('./AddressVerification.sol')

contract('AddressVerification', function ([owner, sender]) {
    let addressVerification

    describe('Verify Address', function () {
        const verificationCode = 0x12345678;

        beforeEach('setup contract for each test', async function ()
        {
            addressVerification = await AddressVerification.new(owner)
        })
        it("stores verification code", async function() {
            await addressVerification.verifyAddress(verificationCode,
                                                        { from : sender});
            const codeReceived = await addressVerification.address_codes(sender);

            assert.equal(codeReceived.toNumber(), verificationCode);
            assert.notEqual(codeReceived.toNumber(), 0x2345);
        })
        it("code mappings default to 0", async function() {
            const codeReceived = await addressVerification.address_codes(sender);
            assert.equal(codeReceived.toNumber(), 0);
        })
        it("changes boolean mapping to true when code is sent", async function() {
            await addressVerification.verifyAddress(verificationCode,
                                                        { from : sender});

            const codeReceived = await addressVerification.address_sent_status(sender);
            assert.equal(codeReceived, true);
        })
        it("stores boolean mapping as false if not sent", async function() {
            const codeReceived = await addressVerification.address_sent_status(sender);
            assert.equal(codeReceived, false);
        })
    })
})
