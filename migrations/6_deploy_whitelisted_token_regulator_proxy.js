var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];
  WhitelistedTokenRegulator.deployed().then(function (whitelistedTokenRegulatorInstance) {
    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
      proxyRegulatorInstance.createRegulatorProxy(whitelistedTokenRegulatorInstance.address, {from:wtRegulatorOwner})
    })
  })
};
