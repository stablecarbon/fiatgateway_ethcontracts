var ValidatorSheet2 = artifacts.require("./ValidatorSheet");
var PermissionSheetMock2 = artifacts.require("./PermissionSheetMock")
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator")
var RegulatorProxy = artifacts.require("./RegulatorProxy")

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];

  deployer.deploy(PermissionSheetMock2, { from: wtRegulatorOwner}).then(function() {
  deployer.deploy(ValidatorSheet2, { from: wtRegulatorOwner }).then(function() {
  // deployer.deploy(WhitelistedTokenRegulator, PermissionSheetMock.address,
  //                                            ValidatorSheet.address, 
  //                                            { from: wtRegulatorOwner }).then(function () {
  // deployer.deploy(RegulatorProxy, WhitelistedTokenRegulator.address, 
  //                                 PermissionSheetMock.address, 
  //                                 ValidatorSheet.address,
  //                                 { from: wtRegulatorOwner })
  // })
  })
  })
};
