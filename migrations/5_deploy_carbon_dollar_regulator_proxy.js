var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");

// Create and claim ownership of new CUSD contract
module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];
  CarbonDollarRegulator.deployed().then(function (carbonDollarRegulatorInstance) {
    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
      proxyRegulatorInstance.createRegulatorProxy(carbonDollarRegulatorInstance.address, { from: cdRegulatorOwner}).then(function () {
      	proxyRegulatorInstance.getCount().then(function (count) {
            proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (cdRegulatorInstance) {
               CarbonDollarRegulator.at(cdRegulatorInstance).claimOwnership({ fro: cdRegulatorOwner })
            })
        })
      });
    })
  })
};
