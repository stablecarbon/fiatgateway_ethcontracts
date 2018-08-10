var ValidatorSheetFactory = artifacts.require("./ValidatorSheetFactory");
var PermissionSheetMockFactory = artifacts.require("./PermissionSheetMockFactory")
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];

  deployer.deploy(WhitelistedTokenRegulator, null, null, { from: wtRegulatorOwner })
};