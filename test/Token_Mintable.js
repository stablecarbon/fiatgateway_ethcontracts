const abi = require('ethereumjs-abi');
const Token_Standard = artifacts.require('Token_Standard')
const Token_Mintable = artifacts.require('Token_Mintable')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenStandard = require('./behaviors/token_standard')
const shouldBehaveLikeTokenMintable = require('./behaviors/token_mintable')

contract('Token_Mintable', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })

    const impl_v0 = await Token_Standard.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await Token_Mintable.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex');
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex');
    const initializeData = '0x' + methodId + params;
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    this.token = await Token_Mintable.at(proxy.address)
  })

  shouldBehaveLikeTokenStandard(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenMintable(proxyOwner, tokenOwner, owner, anotherAccount)
})