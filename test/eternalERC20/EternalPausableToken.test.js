const abi = require('ethereumjs-abi')
const EternalStandardToken = artifacts.require('EternalStandardToken')
const EternalMintableToken = artifacts.require('EternalMintableToken')
const EternalBurnableToken = artifacts.require('EternalBurnableToken')
const EternalPausableToken = artifacts.require('EternalPausableToken')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenStandard = require('./behaviors/EternalStandardToken')
const shouldBehaveLikeTokenMintable = require('./behaviors/EternalMintableToken')
const shouldBehaveLikeTokenBurnable = require('./behaviors/EternalBurnableToken')
const shouldBehaveLikeTokenPausable = require('./behaviors/EternalPausableToken')

contract('EternalPausableToken', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })

    const impl_v0 = await EternalStandardToken.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await EternalMintableToken.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex')
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    const impl_v2 = await EternalBurnableToken.new()
    await proxy.upgradeTo('2', impl_v2.address, { from: proxyOwner })

    const impl_v3 = await EternalPausableToken.new()
    await proxy.upgradeTo('3', impl_v3.address, { from: proxyOwner })

    this.token = await EternalPausableToken.at(proxy.address)
  })

  shouldBehaveLikeTokenStandard(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenMintable(proxyOwner, tokenOwner, owner, anotherAccount)

  shouldBehaveLikeTokenBurnable(tokenOwner, owner)

  shouldBehaveLikeTokenPausable(tokenOwner, owner, recipient, anotherAccount)
})