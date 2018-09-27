var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory")
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");


// Deploy Factories for data storages
module.exports = function(deployer, network, accounts) {
  let factoryOwner = accounts[0];
  console.log('deploying contracts from: ' + factoryOwner)

  // These may have to be deployed one by one instead of in bulk
  // deployer.deploy(RegulatorProxyFactory, {from:factoryOwner})
  // deployer.deploy(CarbonDollarProxyFactory, {from:factoryOwner})
  // deployer.deploy(WhitelistedTokenProxyFactory, {from:factoryOwner})

};
