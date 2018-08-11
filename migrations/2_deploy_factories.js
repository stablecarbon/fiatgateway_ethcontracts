var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory")
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");


// Deploy Factories for data storages
module.exports = function(deployer, network, accounts) {
  let factoryOwner = accounts[0];

  deployer.deploy(RegulatorProxyFactory, {from:factoryOwner})
  deployer.deploy(CarbonDollarProxyFactory, {from:factoryOwner})
  deployer.deploy(WhitelistedTokenProxyFactory, {from:factoryOwner})

};
