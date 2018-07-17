const {basicTokenTests} = require('./BasicToken');
const {
    CommonVariables,
    BasicTokenMock,
    transfersToZeroBecomeBurns
} = require('../helpers/common');

contract('BasicToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const oneHundred = commonVars.userSender;
    const anotherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.token = await BasicTokenMock.new(oneHundred, 100*10**18, { from: owner })
    })

    basicTokenTests([owner, oneHundred, anotherAccount], transfersToZeroBecomeBurns)
})
