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
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

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
                        FeeSheet.deployed().then(function (feeSheetInstance) {
                            StablecoinWhitelist.deployed().then(function (stablecoinWhitelistInstance) {
                                CarbonDollar.deployed().then(function(carbonDollarImplementation) {
                                    deployer.deploy(CarbonDollarProxy, 
                                                    carbonDollarImplementation.address, 
                                                    cdRegulatorInstance, 
                                                    balanceSheetInstance, 
                                                    allowanceSheetInstance, 
                                                    feeSheetInstance.address, 
                                                    stablecoinWhitelistInstance.address, 
                                                    {from:cdTokenOwner, gas:100000000})
                                })
                            });
                        });
                    })
                })
            })
        })
    })

    
};