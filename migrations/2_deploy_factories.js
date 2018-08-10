var ValidatorSheetFactory = artifacts.require("./ValidatorSheetFactory");
var PermissionSheetMockFactory = artifacts.require("./PermissionSheetMockFactory")
var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory")
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory")
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory")

// Deploy Factories for data storages
module.exports = function(deployer, network, accounts) {
  let factoryOwner = accounts[0];

  deployer.deploy(ValidatorSheetFactory, {from:factoryOwner})
  deployer.deploy(PermissionSheetMockFactory, {from:factoryOwner})
  deployer.deploy(AllowanceSheetFactory, {from:factoryOwner})
  deployer.deploy(BalanceSheetFactory, {from:factoryOwner})
  deployer.deploy(RegulatorProxyFactory, {from:factoryOwner})



};
