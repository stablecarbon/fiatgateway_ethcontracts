const { CommonVariables } = require('../../helpers/common');
const { tokenSetup } = require("../../helpers/tokenSetup");
const { carbonDollarStorageInteractionTests } = require('./carbonDollarBehavior/CarbonDollarStorageBasicInteractions.js');
const { carbonDollarBehaviorTests } = require('./carbonDollarBehavior/CarbonDollarBehavior.js')

contract('CarbonDollar', _accounts => {
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
        this.token = this.cdToken;
    });

    describe("Carbon Dollar tests", function () {
        carbonDollarStorageInteractionTests(owner, minter);
        carbonDollarBehaviorTests(owner, user, whitelisted, validator);
    });
})