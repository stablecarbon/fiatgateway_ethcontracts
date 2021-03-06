const { CommonVariables } = require('../../helpers/common');
const { tokenSetup } = require("../../helpers/tokenSetup");
const { carbonDollarBehaviorTests } = require('./carbonDollarBehavior/CarbonDollarBehavior.js')
const { carbonDollarStorageInteractionTests } = require('./carbonDollarBehavior/CarbonDollarStorageBasicInteractions.js')
contract('CarbonDollar', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const minter = commonVars.user
    const validator = commonVars.validator
    const blacklisted = commonVars.attacker
    const anotherUser = commonVars.user3
    const user = commonVars.validator2

    beforeEach(async function () {
        await tokenSetup.call(this, validator, minter, owner, blacklisted);
        this.token = this.cdToken;
    });

    describe("Carbon Dollar tests", function () {
        carbonDollarBehaviorTests(owner, minter, user, validator, blacklisted);
        carbonDollarStorageInteractionTests(owner, minter)
    });
})