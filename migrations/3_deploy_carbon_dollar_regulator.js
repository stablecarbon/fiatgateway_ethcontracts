var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var PermissionSheet = artifacts.require("./PermissionSheet")
var ValidatorSheet = artifacts.require("./ValidatorSheet")
var Regulator = artifacts.require("./Regulator")

module.exports = function(deployer, network, accounts) {
  let regulator = accounts[0];
  let token = accounts[1];

  // Testing regular Regulator 
  deployer.deploy(PermissionSheet, {from:regulator})
  deployer.deploy(ValidatorSheet, {from:regulator})
  // deployer.deploy(Regulator, PermissionSheet.address, ValidatorSheet.address, {from:regulator})
  // deployer.deploy(RegulatorLogicFactory, {from:regulator})
  // deployer.deploy(RegulatorProxyFactory, {from:regulator})

  // PermissionedToken 
  // deployer.deploy(BalanceSheet, {from:token})
  // deployer.deploy(AllowanceSheet, {from:token})
  // deployer.deploy(PermissionedToken, Regulator.address, BalanceSheet.address, AllowanceSheet.address, {from:token})
  // deployer.deploy(PermissionedTokenLogicFactory, {from:token})
  // deployer.deploy(PermissionedTokenProxyFactory, {from:token})
};
