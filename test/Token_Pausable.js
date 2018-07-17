const abi = require('ethereumjs-abi')
const Token_Standard = artifacts.require('Token_Standard')
const Token_Mintable = artifacts.require('Token_Mintable')
const Token_Burnable = artifacts.require('Token_Burnable')
const Token_Pausable = artifacts.require('Token_Pausable')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenStandard = require('./behaviors/token_standard')
const shouldBehaveLikeTokenMintable = require('./behaviors/token_mintable')
const shouldBehaveLikeTokenBurnable = require('./behaviors/token_burnable')
const shouldBehaveLikeTokenPausable = require('./behaviors/token_pausable')

contract('Token_Pausable', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })

    const impl_v0 = await Token_Standard.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await Token_Mintable.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex')
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    const impl_v2 = await Token_Burnable.new()
    await proxy.upgradeTo('2', impl_v2.address, { from: proxyOwner })

    const impl_v3 = await Token_Pausable.new()
    await proxy.upgradeTo('3', impl_v3.address, { from: proxyOwner })

    this.token = await Token_Pausable.at(proxy.address)
  })

  shouldBehaveLikeTokenStandard(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenMintable(proxyOwner, tokenOwner, owner, anotherAccount)

  shouldBehaveLikeTokenBurnable(tokenOwner, owner)

  shouldBehaveLikeTokenPausable(tokenOwner, owner, recipient, anotherAccount)
})