var ValidatorSheetFactory = artifacts.require("./ValidatorSheetFactory");
var PermissionSheetMockFactory = artifacts.require("./PermissionSheetMockFactory")
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");

module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];

  var validatorFactoryInstance
  var permissionFactoryInstance

  var validatorSheetInstance
  var permissionSheetInstance

  ValidatorSheetFactory.deployed().then(function(instance) {
    validatorFactoryInstance = instance
    validatorFactoryInstance.createValidatorSheet().then(function() {
      validatorFactoryInstance.getCount().then(function(count) {
        validatorFactoryInstance.getValidatorSheet(count-1).then(function(newSheet) {
          validatorSheetInstance = newSheet
          console.log('CD: new vsheet: ' + validatorSheetInstance)

        })
      })
    })
  }).then(function() {
    PermissionSheetMockFactory.deployed().then(function(instance) {
      permissionFactoryInstance = instance
      permissionFactoryInstance.createPermissionSheet().then(function() {
        permissionFactoryInstance.getCount().then(function(count) {
          permissionFactoryInstance.getPermissionSheet(count-1).then(function(newSheet) {
            permissionSheetInstance = newSheet
            console.log('CD: new psheet: ' + permissionSheetInstance)
          })
        })
      })
    }).then(function() {
      deployer.deploy(CarbonDollarRegulator, permissionSheetInstance, validatorSheetInstance, {from:cdRegulatorOwner})
    })
  })

};
