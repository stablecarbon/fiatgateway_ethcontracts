var ValidatorSheet = artifacts.require("./ValidatorSheet");
var PermissionSheetMock = artifacts.require("./PermissionSheetMock")
var WhitelistedToken = artifacts.require("./WhitelistedTokenRegulator")
var RegulatorProxy = artifacts.require("./RegulatorProxy")

module.exports = function (deployer, network, accounts) {
    let wtRegulatorOwner = accounts[0];

    // deployer.deploy(BalanceSheet, { from: wtRegulatorOwner }).then(function () {
    // deployer.deploy(ValidatorSheet, { from: wtRegulatorOwner }).then(function () {
    //         deployer.deploy(WhitelistedTokenRegulator, PermissionSheetMock.address,
    //             ValidatorSheet.address,
    //             { from: wtRegulatorOwner }).then(function () {
    //                 deployer.deploy(RegulatorProxy, WhitelistedTokenRegulator.address,
    //                     PermissionSheetMock.address,
    //                     ValidatorSheet.address,
    //                     { from: wtRegulatorOwner })
    //             })
    //     })
    // })
};
