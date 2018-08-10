var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory");
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory")
var FeeSheet = artifacts.require("./FeeSheet");
var StablecoinWhitelist = artifacts.require("./StablecoinWhitelist");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var CarbonDollar = artifacts.require("./CarbonDollar");
var CarbonDollarProxy = artifacts.require("./CarbonDollarProxy");

module.exports = function (deployer, network, accounts) {
    let cdTokenOwner = accounts[0];
    var allowanceSheetInstance
    var balanceSheetInstance

    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
        proxyRegulatorInstance.getCount().then(function (count) {
            proxyRegulatorInstance.getRegulatorProxy(count - 2).then(function (cdRegulatorInstance) {
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
                                    cdRegulatorInstance.address,
                                    balanceSheetInstance.address,
                                    allowanceSheetInstance.address,
                                    feeSheetInstance.address,
                                    stablecoinWhitelistInstance.address, { from: cdTokenOwner }).then(function (carbonDollarInstance) {
                                        deployer.deploy(CarbonDollarProxy,
                                            carbonDollarInstance.address,
                                            cdRegulatorInstance.address,
                                            balanceSheetInstance.address,
                                            allowanceSheetInstance.address,
                                            feeSheetInstance.address,
                                            stablecoinWhitelistInstance.address, { from: cdTokenOwner });
                                })
                            });
                        });
                    })
                })
            })
        })
    })

    
};