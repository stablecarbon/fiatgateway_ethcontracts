const { mintableTokenTests } = require('./MintableToken');
const {
    CommonVariables,
    ModularMintableToken,
    BalanceSheet,
    AllowanceSheet
} = require('../helpers/common');

contract('MintableToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const oneHundred = commonVars.userSender;
    const anotherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        const balanceSheet = await BalanceSheet.new({ from: owner })
        const allowanceSheet = await AllowanceSheet.new({ from: owner })
        this.token = await ModularMintableToken.new({ from: owner })
        await balanceSheet.transferOwnership(this.token.address, { from: owner })
        await this.token.setBalanceSheet(balanceSheet.address, { from: owner })
        await allowanceSheet.transferOwnership(this.token.address, { from: owner })
        await this.token.setAllowanceSheet(allowanceSheet.address, { from: owner })
    })

    mintableTokenTests([owner, oneHundred, anotherAccount])
})
