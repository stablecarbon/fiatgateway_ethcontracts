var PermissionSheetMock = artifacts.require("./PermissionSheetMock");
var ValidatorSheet = artifacts.require("./ValidatorSheet");
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");

module.exports = function(deployer, network, accounts) {
  let regulator = accounts[0];
  let user = accounts[1];
  let whitelistedTokenInstance = null;
  let permissionSheetInstance = null;
  let validatorSheetInstance = null;

  let mint = null;
  let mint_cusd = null
  let convert_wt = null
  let convert_cd = null
  let burn = null
  let destroy_blacklisted = null
  let spend_blacklisted = null
  let blacklisted = null

  // WHITELISTEDTOKEN

  // PermissionSheet add all permissions
  deployer.deploy(PermissionSheetMock, {from:regulator}).then(function () {
    return PermissionSheetMock.deployed().then(function (instance) {
      permissionSheetInstance = instance
      return permissionSheetInstance.MINT_SIG().then(function (sig) {
        mint = sig
        return permissionSheetInstance.MINT_CUSD_SIG().then(function (sig) {
          mint_cusd = sig
          return permissionSheetInstance.CONVERT_WT_SIG().then(function (sig) {
            convert_wt = sig
            return permissionSheetInstance.CONVERT_CARBON_DOLLAR_SIG().then(function (sig) {
              convert_cd = sig
              return permissionSheetInstance.BURN_SIG().then(function (sig) {
                burn = sig
                return permissionSheetInstance.DESTROY_BLACKLISTED_TOKENS_SIG().then(function (sig) {
                  destroy_blacklisted = sig
                  return permissionSheetInstance.APPROVE_BLACKLISTED_ADDRESS_SPENDER_SIG().then(function (sig) {
                    spend_blacklisted = sig
                    return permissionSheetInstance.BLACKLISTED_SIG().then(function (sig) {
                      blacklisted = sig
                    })
                  })
                })
              })
            })
          })
        })
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
            })
          })
        })
      })
    })
  })

};
