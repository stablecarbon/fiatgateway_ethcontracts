const { modularTokenTests } = require('./ModularTokenTests');
const {
    Regulator,
    RegulatorMock,
    RegulatorProxy,
    MutablePermissionedToken,
    CommonVariables
} = require('../helpers/common');

contract('MutablePermissionedToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const minter = commonVars.tokenOwner;
    const oneHundred = commonVars.userSender;
    const anotherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.rProxy = await RegulatorProxy.new({ from: owner })   
        this.regulator = await RegulatorMock.new(validator, minter, oneHundred, blacklisted, anotherAccount, { from: owner })   
        this.token = await MutablePermissionedToken.new(rProxy.address, {from: owner})

        this.regulator.transferOwnership(rProxy.address, {from:owner});
        this.rProxy.claimRegulatorOwnership(this.regulator.address, {from:owner});
        this.rProxy.transferOwnership(this.token.address, { from: owner });

        this.token.mint(oneHundred, 100*10**18, {from: minter});
    })
    
    describe("MutablePermissionedToken tests", function() {
        modularTokenTests([owner, oneHundred, anotherAccount])
    });
})
