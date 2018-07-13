const { basicTokenTests } = require('./BasicToken');
const { standardTokenTests } = require('./StandardToken');
const {
    StandardTokenMock,
    CommonVariables
} = require('../helpers/common');

contract('StandardToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const oneHundred = commonVars.userSender;
    const anotherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.token = await StandardTokenMock.new(oneHundred, 100*10**18)
    })

    basicTokenTests([owner, oneHundred, anotherAccount])
    standardTokenTests([owner, oneHundred, anotherAccount])
})
