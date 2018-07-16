const Token_Standard = artifacts.require('Token_Standard')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenStandard = require('./behaviors/token_standard')

contract('Token_Standard', function ([_, proxyOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })
    const impl_v0 = await Token_Standard.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })
    this.token = await Token_Standard.at(proxy.address)
  })

  shouldBehaveLikeTokenStandard(owner, owner, recipient, anotherAccount)
})