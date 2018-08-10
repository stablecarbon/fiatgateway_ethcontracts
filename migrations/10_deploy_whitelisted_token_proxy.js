var AllowanceSheetFactory = artifacts.require("./AllowanceSheetFactory");
var BalanceSheetFactory = artifacts.require("./BalanceSheetFactory")
var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedToken = artifacts.require("./CarbonDollar");
var CarbonDollarProxy = artifacts.require("./CarbonDollarProxy");

module.exports = function (deployer, network, accounts) {
    let wtTokenOwner = accounts[0];
    var allowanceSheetInstance
    var balanceSheetInstance
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

    // CarbonDollarProxy.deployed().then(function(cd) {
    //     console.log(cd)
    // })
    // RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
    //     proxyRegulatorInstance.getCount().then(function (count) {
    //         proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
    //             AllowanceSheetFactory.deployed().then(function (allowanceFactoryInstance) {
    //                 allowanceFactoryInstance.createAllowanceSheet().then(function () {
    //                     allowanceFactoryInstance.getCount().then(function (count) {
    //                         allowanceFactoryInstance.getAllowanceSheet(count - 1).then(function (newSheet) {
    //                             allowanceSheetInstance = newSheet
    //                         })
    //                     })
    //                 })
    //             }).then(function () {
    //                 BalanceSheetFactory.deployed().then(function (balanceFactoryInstance) {
    //                     balanceFactoryInstance.createBalanceSheet().then(function () {
    //                         balanceFactoryInstance.getCount().then(function (count) {
    //                             balanceFactoryInstance.getBalanceSheet(count - 1).then(function (newSheet) {
    //                                 balanceSheetInstance = newSheet
    //                             })
    //                         })
    //                     })
    //                 }).then(function () {
    //                     CarbonDollarProxy.deployed().then(function(cusd) {
    //                         deployer.deploy(WhitelistedToken, 
    //                                         wtRegulatorInstance, 
    //                                         balanceSheetInstance, 
    //                                         allowanceSheetInstance,
    //                                         cusd.address, 
    //                                         {from:wtTokenOwner, gas:100000000})
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // })

    
};