const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');
const { CarbonDollarStorage } = require('../../helpers/artifacts');
const { carbonDollarStorageTests } = require('./carbonDollarStorageBehavior/CarbonDollarStorage.js');

contract('CarbonDollarStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const tokenHolder = commonVars.user2;
    const spender = commonVars.user3;
    beforeEach(async function () {
        this.storage = await CarbonDollarStorage.new({ from: owner })
    })
    describe("CarbonDollarStorage tests", function () {
       carbonDollarStorageTests(owner, tokenHolder, spender, user);
    })
})
