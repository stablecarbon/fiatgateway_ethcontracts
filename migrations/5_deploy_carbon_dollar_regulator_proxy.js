var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");

module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];
  CarbonDollarRegulator.deployed().then(function (carbonDollarRegulatorInstance) {
    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
      proxyRegulatorInstance.createRegulatorProxy(carbonDollarRegulatorInstance.address, { from: cdRegulatorOwner});
    })
  })
};
