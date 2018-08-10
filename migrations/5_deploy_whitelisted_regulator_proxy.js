var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory");
var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory")
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];

  var validatorFactoryInstance
  var permissionFactoryInstance

  var validatorSheetInstance
  var permissionSheetInstance

  var whitelistedRegulatorInstance
  var proxyRegulatorInstance

  // WhitelistedTokenRegulator.deployed().then(function(regInstance) {
  //   whitelistedRegulatorInstance = regInstance
  //   RegulatorProxyFactory.deployed().then(function(proxyInstance) {
  //       proxyRegulatorInstance = proxyInstance
  //       proxyRegulatorInstance.createRegulator(whitelistedRegulatorInstance, {from:wtRegulatorOwner}).then(function() {
  //           console.log('created WT regulator')
  //       })
  //   })
  // })

};
