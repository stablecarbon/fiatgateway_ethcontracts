var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedToken = artifacts.require("./WhitelistedToken");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");


// This cost around 1mm gas on 9/12/18
module.exports = function (deployer, network, accounts) {
    let wtTokenOwner = accounts[0];

    // CarbonDollarProxyFactory.deployed().then(function (proxyCDInstance) {
    //     proxyCDInstance.getCount().then(function (count) {
    //         proxyCDInstance.getToken(count-1).then(function (cdInstance) {
    //             RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
    //                 proxyRegulatorInstance.getCount().then(function (count) {
    //                     proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
    //                           WhitelistedToken.deployed().then(function(wtImplementation) {
    //                             WhitelistedTokenProxyFactory.deployed().then(function(wtProxyFactory) {
    //                                 wtProxyFactory.createToken(wtImplementation.address, cdInstance, wtRegulatorInstance, {from:wtTokenOwner}).then(function () {
    //                                     wtProxyFactory.getCount().then(function (tokenCount) {
    //                                         wtProxyFactory.getToken(tokenCount-1).then(function (instance) {
    //                                             WhitelistedToken.at(instance).claimOwnership({ from: wtTokenOwner })
    //                                         })
    //                                     })
    //                                 })
    //                             })
    //                         })
    //                       })
    //                 })
    //             })
    //         })
    //     })
    // })



};
