var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory")
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory")
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory")
var FeeSheet = artifacts.require("./FeeSheet")
var StablecoinWhitelist = artifacts.require("./StablecoinWhitelist")

// Deploy Factories for data storages
module.exports = function(deployer, network, accounts) {
  let factoryOwner = accounts[0];

  deployer.deploy(AllowanceSheetFactory, {from:factoryOwner})
  deployer.deploy(BalanceSheetFactory, {from:factoryOwner})
  deployer.deploy(RegulatorProxyFactory, {from:factoryOwner})
  deployer.deploy(FeeSheet, {from:factoryOwner})
  deployer.deploy(StablecoinWhitelist, {from:factoryOwner})
};
