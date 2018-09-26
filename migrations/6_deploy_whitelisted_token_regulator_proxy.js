var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");

// Create and claim ownership of new WhitelistedToken contract
// This cost around 2mm gas on 9/12/18
module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];
  // WhitelistedTokenRegulator.deployed().then(function (whitelistedTokenRegulatorInstance) {
  //   RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
  //     proxyRegulatorInstance.createRegulatorProxy(whitelistedTokenRegulatorInstance.address, {from:wtRegulatorOwner}).then(function () {
  //     	proxyRegulatorInstance.getCount().then(function (count) {
  //           proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
  //              WhitelistedTokenRegulator.at(wtRegulatorInstance).claimOwnership({ fro: wtRegulatorOwner })
  //           })
  //       })
  //     })
  //   })
  // })
};
