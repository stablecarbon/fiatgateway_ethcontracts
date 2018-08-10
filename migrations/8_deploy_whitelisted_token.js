var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory");
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory");
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory")
var WhitelistedToken = artifacts.require("./WhitelistedToken");
var CarbonDollarProxy = artifacts.require("./CarbonDollarProxy");

module.exports = function (deployer, network, accounts) {
    let wtTokenOwner = accounts[0];
    var allowanceSheetInstance
    var balanceSheetInstance
    
    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
        proxyRegulatorInstance.getCount().then(function (count) {
            proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
                CarbonDollarProxy.deployed().then(function (cusdInstance) {
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
                            deployer.deploy(WhitelistedToken,
                                wtRegulatorInstance.address,
                                balanceSheetInstance.address,
                                allowanceSheetInstance.address,
                                cusdInstance.address, { from: wtTokenOwner })
                            });
                    });
                });
            });
        });
    })
}