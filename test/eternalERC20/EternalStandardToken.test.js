const EternalStandardToken = artifacts.require('EternalStandardToken')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenStandard = require('./behaviors/EternalStandardToken')

contract('EternalStandardToken', function ([_, proxyOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })
    const impl_v0 = await EternalStandardToken.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })
    this.token = await EternalStandardToken.at(proxy.address)
  })

  shouldBehaveLikeTokenStandard(owner, owner, recipient, anotherAccount)
})