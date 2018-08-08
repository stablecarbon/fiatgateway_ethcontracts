var PermissionSheetMock = artifacts.require("./PermissionSheetMock");
var ValidatorSheet = artifacts.require("./ValidatorSheet");
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var WhitelistedToken = artifacts.require("./WhitelistedToken");
var CarbonDollar = artifacts.require("./CarbonDollar");
var BalanceSheet = artifacts.require("./BalanceSheet");
var AllowanceSheet = artifacts.require("./AllowanceSheet");


module.exports = function(deployer, network, accounts) {
  let regulator = accounts[0];
  let user = accounts[1];
  let whitelistedTokenInstance = null;
  let whitelistedTokenToken = null;
  let permissionSheetInstance = null;
  let validatorSheetInstance = null;

  // WHITELISTEDTOKEN

  // PermissionSheet add all permissions
  deployer.deploy(PermissionSheetMock, {from:regulator}).then(function () {
    return PermissionSheetMock.deployed().then(function (instance) {
      return PermissionSheetMock.new({ from:regulator }).then(function (newInstance) {
        console.log('deployed: ' + instance.address)
        console.log('new: ' + newInstance.address)
        permissionSheetInstance = instance
      })
    })
  }).then(function () {
  // ValidatorSheet with one validator
    deployer.deploy(ValidatorSheet, {from:regulator}).then(function () {
      return ValidatorSheet.deployed().then(function (instance) {
        validatorSheetInstance = instance
        validatorSheetInstance.addValidator(regulator, {from:regulator})
      })
    }).then(function () {
      // WhitelistedTokenRegulator and transfer data storage ownership
      deployer.deploy(WhitelistedTokenRegulator, PermissionSheetMock.address, ValidatorSheet.address, {from:regulator}).then(function () {
        return WhitelistedTokenRegulator.deployed().then(function(instance) {
          whitelistedTokenInstance = instance
          return permissionSheetInstance.transferOwnership(whitelistedTokenInstance.address, {from:regulator}).then(function () {
            return validatorSheetInstance.transferOwnership(whitelistedTokenInstance.address, {from:regulator}).then(function () {
              // Set regulator as minter, user as whitelisted
              whitelistedTokenInstance.setMinter(regulator, {from:regulator})
              whitelistedTokenInstance.setWhitelistedUser(user, {from:regulator})
            }).then(function () {
                deployer.deploy(BalanceSheet, {from:regulator}).then(function () {
                  return BalanceSheet.deployed().then(function (instance) {
                    balanceSheetInstance = instance
                  })
                }).then(function () {
                  deployer.deploy(AllowanceSheet, {from:regulator}).then(function () {
                    return AllowanceSheet.deployed().then(function (instance) {
                      allowanceSheetInstance = instance
                    })
                  })
                })
            })
          })
        })
      })
    })
  })

};
