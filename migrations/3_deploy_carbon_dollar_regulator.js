var ValidatorSheet = artifacts.require("./ValidatorSheet");
var PermissionSheetMock = artifacts.require("./PermissionSheetMock")
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator")
var RegulatorProxy = artifacts.require("./RegulatorProxy")

module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];
  let token = accounts[1];

  // Testing regular Regulator 
  deployer.deploy(PermissionSheetMock, { from: cdRegulatorOwner}).then(function() {
  deployer.deploy(ValidatorSheet, { from: cdRegulatorOwner }).then(function() {
  deployer.deploy(CarbonDollarRegulator, PermissionSheetMock.address,
                                             ValidatorSheet.address, 
                                             { from: cdRegulatorOwner }).then(function () {
  deployer.deploy(RegulatorProxy, CarbonDollarRegulator.address, 
                                  PermissionSheetMock.address, 
                                  ValidatorSheet.address, 
                                  { from: cdRegulatorOwner })
  })
  })
  })
};
