const { burnableTokenTests } = require('./BurnableToken');
const {
    CommonVariables,
    BurnableTokenMock,
    transfersToZeroBecomeBurns
} = require('../helpers/common');

contract('BurnableToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const oneHundred = commonVars.userSender;
    const anotherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.token = await BurnableTokenMock.new(oneHundred, 100 * 10 ** 18, { from: owner })
    })

    burnableTokenTests([owner, oneHundred, anotherAccount], transfersToZeroBecomeBurns)
})
