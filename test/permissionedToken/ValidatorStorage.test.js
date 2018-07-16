const {
    CommonVariables,
    expectRevert,
    ValidatorStorage,
} = require('../helpers/common');

contract('ValidatorStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const account2 = commonVars.userSender;
    const validator = commonVars.tokenValidator;
    const validator2 = commonVars.tokenValidator2;

    beforeEach(async function () {
        this.sheet = await ValidatorStorage.new({ from: owner })
    })

    describe('when the sender is the owner', function () {
        const from = owner

        describe('addValidator', function () {
            it("adds one validator", async function () {
                await this.sheet.addValidator(validator, { from });
                assert(await this.sheet.isValidator(validator));
            })
            it("adds two validators", async function () {
                await this.sheet.addValidator(validator, { from });
                await this.sheet.addValidator(validator2, { from });
                assert(await this.sheet.isValidator(validator));
                assert(await this.sheet.isValidator(validator2));
            })
            it("emits a validator added event", async function () {
                const { logs } = await this.sheet.addValidator(validator, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'ValidatorAdded');
                assert.equal(logs[0].args.validator, validator);
            })
        })

        describe('removeValidator', function () {
            it("removes the validator", async function () {
                await this.sheet.removeValidator(validator, { from });
                const validated = await this.sheet.isValidator(validator);
                assert(!validated);
            })
            it("emits a validator removed event", async function () {
                const { logs } = await this.sheet.removeValidator(validator, { from });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'ValidatorRemoved');
                assert.equal(logs[0].args.validator, validator);
            })
        })
    })

    describe('when the sender is not the owner', function () {
        const from = account2
        it('reverts all calls', async function () {
            await expectRevert(this.sheet.addValidator(validator, { from }));
            await expectRevert(this.sheet.removeValidator(validator, { from }));
        })
    })
})