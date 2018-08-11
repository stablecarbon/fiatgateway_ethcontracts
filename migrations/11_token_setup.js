var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");

module.exports = function (deployer, network, accounts) {
    let tokenOwner = accounts[0]; // creator of regulators should be a validator as well, see RegulatorProxyFactory.sol

    // Both WT and CD regulators need to whitelist CD for conversion
    CarbonDollarProxyFactory.deployed().then(function (proxyCDInstance) {
        proxyCDInstance.getCount().then(function (count) {
            proxyCDInstance.getToken(count-1).then(function (cdInstance) {
                RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
                    proxyRegulatorInstance.getCount().then(function (count) {
                        proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
                            proxyRegulatorInstance.getRegulatorProxy(count - 2).then(function (cdRegulatorInstance) {
                                CarbonDollarRegulator.at(cdRegulatorInstance).setWhitelistedUser(cdInstance, {from:tokenOwner}).then(function () {
                                    WhitelistedTokenRegulator.at(wtRegulatorInstance).setWhitelistedUser(cdInstance, {from:tokenOwner})
                                })
                            })
                        })
                    })
                })   
            })
        })
    })


    
};