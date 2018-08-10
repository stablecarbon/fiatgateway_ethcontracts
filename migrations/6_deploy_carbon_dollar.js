var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory");
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory")
var WhitelistedToken = artifacts.require("./WhitelistedToken");
var CarbonDollarProxy = artifacts.require("./CarbonDollarProxy");

module.exports = function (deployer, network, accounts) {
    let cdTokenOwner = accounts[0];
    var allowanceSheetInstance
    var balanceSheetInstance

    AllowanceSheetFactory.deployed().then(function (allowanceFactoryInstance) {
        allowanceFactoryInstance.createAllowanceSheet().then(function () {
            allowanceFactoryInstance.getCount().then(function (count) {
                allowanceFactoryInstance.getAllowanceSheet(count - 1).then(function (newSheet) {
                    allowanceSheetInstance = newSheet
                    console.log('WT: new vsheet: ' + allowanceSheetInstance)
                })
            })
        })
    }).then(function () {
        BalanceSheetFactory.deployed().then(function (balanceFactoryInstance) {
            balanceFactoryInstance.createBalanceSheet().then(function () {
                balanceFactoryInstance.getCount().then(function (count) {
                    balanceFactoryInstance.getBalanceSheet(count - 1).then(function (newSheet) {
                        balanceSheetInstance = newSheet
                        console.log('WT: new psheet: ' + balanceSheetInstance)
                    })
                })
            })
        }).then(function () {
            deployer.deploy(FeeSheet, { from: cdTokenOwner }).then(function (feeSheetInstance) {
                deployer.deploy(StablecoinWhitelist, { from: cdTokenOwner }).then(function (stablecoinWhitelistInstance) {
                    deployer.deploy(CarbonDollar,
                        cdRegulatorInstance,
                        balanceSheetInstance,
                        allowanceSheetInstance,
                        feeSheetInstance,
                        stablecoinWhitelistInstance, { from: cdTokenOwner }).then(function (carbonDollarInstance) {
                            deployer.deploy(CarbonDollarProxy,
                                carbonDollarInstance,
                                cdRegulatorInstance,
                                balanceSheetInstance,
                                allowanceSheetInstance,
                                feeSheetInstance,
                                stablecoinWhitelistInstance, { from: cdTokenOwner });
                        })
                });
            });
        })
    })
};