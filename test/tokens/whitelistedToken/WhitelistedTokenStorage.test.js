const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');
const { whitelistedTokenStorageTests } = require('./whitelistedTokenStorageBehavior/WhitelistedTokenStorage.js');

contract('WhitelistedTokenStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;

    describe("WhitelistedTokenStorage tests", function () {
       whitelistedTokenStorageTests(owner, user);
    })
})
