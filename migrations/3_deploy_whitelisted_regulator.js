var ValidatorSheetFactory = artifacts.require("./ValidatorSheetFactory");
var PermissionSheetMockFactory = artifacts.require("./PermissionSheetMockFactory")
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");

module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];

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
          console.log('WT: new vsheet: ' + validatorSheetInstance)
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
            console.log('WT: new psheet: ' + permissionSheetInstance)
          })
        })
      })
    }).then(function() {
      deployer.deploy(WhitelistedTokenRegulator, permissionSheetInstance, validatorSheetInstance, {from:wtRegulatorOwner})
    })
  })

};
