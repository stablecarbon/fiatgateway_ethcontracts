var ValidatorSheet = artifacts.require("./ValidatorSheet");
var PermissionSheetMock = artifacts.require("./PermissionSheetMock")
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator")
var RegulatorProxy = artifacts.require("./RegulatorProxy")

module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];
  let token = accounts[1];

  // Testing regular Regulator 
  PermissionSheetMock.deployed().then(function(permissionSheet) {
    console.log(permissionSheet)
  })

};
