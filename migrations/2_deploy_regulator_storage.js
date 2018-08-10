var ValidatorSheet = artifacts.require("./ValidatorSheet");
var PermissionSheetMock = artifacts.require("./PermissionSheetMock")

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];

  deployer.deploy(PermissionSheetMock, { from: wtRegulatorOwner}).then(function() {
  deployer.deploy(ValidatorSheet, { from: wtRegulatorOwner }).then(function() {
  })
  })
};
