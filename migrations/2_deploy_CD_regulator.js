var PermissionSheetMock = artifacts.require("./PermissionSheetMock");
var ValidatorSheet = artifacts.require("./ValidatorSheet");
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");
var BalanceSheet = artifacts.require("./BalanceSheet");
var AllowanceSheet = artifacts.require("./AllowanceSheet");
var FeeSheet = artifacts.require("./FeeSheet");
var StablecoinWhitelist = artifacts.require("./StablecoinWhitelist");
var CarbonDollar = artifacts.require("./CarbonDollar");

var RegulatorProxy = artifacts.require("./RegulatorProxy")

module.exports = function(deployer, network, accounts) {
  let regulator = accounts[0];
  let user = accounts[1];
  let carbonDollarInstance = null;
  let permissionSheetInstance = null;
  let validatorSheetInstance = null;
  let carbonDollarTokenInstance = null;
  let balanceSheetInstance = null;
  let allowanceSheetInstance = null;
  let feeSheetInstance = null
  let whitelistInstance = null

  // CARBONDOLLAR

  // PermissionSheet add all permissions
  deployer.deploy(PermissionSheetMock, {from:regulator}).then(function () {
    return PermissionSheetMock.deployed().then(function (instance) {
      permissionSheetInstance = instance
    })
  }).then(function () {
  // ValidatorSheet with one validator
    deployer.deploy(ValidatorSheet, {from:regulator}).then(function () {
      return ValidatorSheet.deployed().then(function (instance) {
        validatorSheetInstance = instance
        validatorSheetInstance.addValidator(regulator, {from:regulator})
      })
    }).then(function () {
      // CarbonDollarRegulator and transfer data storage ownership
      deployer.deploy(CarbonDollarRegulator, PermissionSheetMock.address, ValidatorSheet.address, {from:regulator}).then(function () {
        return CarbonDollarRegulator.deployed().then(function(instance) {
          carbonDollarInstance = instance
          return permissionSheetInstance.transferOwnership(carbonDollarInstance.address, {from:regulator}).then(function () {
            return validatorSheetInstance.transferOwnership(carbonDollarInstance.address, {from:regulator}).then(function () {
              // Set regulator as minter, user as whitelisted
              carbonDollarInstance.setMinter(regulator, {from:regulator})
              carbonDollarInstance.setWhitelistedUser(user, {from:regulator})
            }).then(function () {
              // Deploy CD Token data stores
                deployer.deploy(BalanceSheet, {from:regulator}).then(function () {
                  return BalanceSheet.deployed().then(function (instance) {
                    balanceSheetInstance = instance
                  })
                }).then(function () {
                  deployer.deploy(AllowanceSheet, {from:regulator}).then(function () {
                    return AllowanceSheet.deployed().then(function (instance) {
                      allowanceSheetInstance = instance
                    })
                  }).then(function () {
                    deployer.deploy(FeeSheet, {from:regulator}).then(function () {
                      return FeeSheet.deployed().then(function (instance) {
                        feeSheetInstance = instance
                      })
                    }).then(function () {
                      deployer.deploy(StablecoinWhitelist, {from:regulator}).then(function () {
                        return StablecoinWhitelist.deployed().then(function (instance) {
                          whitelistInstance = instance
                        })
                      }).then(function () {
                        deployer.deploy(CarbonDollar, CarbonDollarRegulator.address, BalanceSheet.address, AllowanceSheet.address, FeeSheet.address, StablecoinWhitelist.address, {from:regulator}).then(function () {
                          return CarbonDollar.deployed().then(function (instance) {
                            carbonDollarTokenInstance = instance
                            // Transfer ownerships
                            return balanceSheetInstance.transferOwnership(carbonDollarTokenInstance.address, {from:regulator}).then(function () {
                              return allowanceSheetInstance.transferOwnership(carbonDollarTokenInstance.address, {from:regulator}).then(function () {
                                return feeSheetInstance.transferOwnership(carbonDollarTokenInstance.address, {from:regulator}).then(function () {
                                  return whitelistInstance.transferOwnership(carbonDollarTokenInstance.address, {from:regulator}).then(function () {
                                    // CD Regulator needs to whitelist CD Token
                                    carbonDollarInstance.setWhitelistedUser(carbonDollarTokenInstance.address, {from:regulator})
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
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
