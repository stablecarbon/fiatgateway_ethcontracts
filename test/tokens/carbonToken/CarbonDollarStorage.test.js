const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');
const { FeeSheet, StablecoinWhitelist } = require('../../helpers/artifacts');
const { carbonDollarStorageTests } = require('./carbonDollarStorageBehavior/CarbonDollarStorage.js');

contract('CarbonDollarStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const tokenHolder = commonVars.user2;
    const spender = commonVars.user3;
    beforeEach(async function () {
        this.feeSheet = await FeeSheet.new({from:owner})
        this.stablecoinWhitelist = await StablecoinWhitelist.new({ from: owner })

    })
    describe("CarbonDollarStorage tests", function () {
       carbonDollarStorageTests(owner, tokenHolder, spender, user);
    })
})
