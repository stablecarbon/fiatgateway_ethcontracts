var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");
var CarbonDollar = artifacts.require("./CarbonDollar");

module.exports = function (deployer, network, accounts) {
    let tokenOwner = accounts[0]; 
    // creator of regulators should be a validator as well, see RegulatorProxyFactory.sol which uses ValidatorSheetMock to add an initial validator

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

    // Separately, CD token should whitelist WT as a stablecoin
    CarbonDollarProxyFactory.deployed().then(function (cdFactory) {
        cdFactory.getCount().then(function (count) {
            cdFactory.getToken(count-1).then(function (cdInstance) {
                WhitelistedTokenProxyFactory.deployed().then(function (wtFactory) {
                    wtFactory.getCount().then(function (countWT) {
                        wtFactory.getToken(countWT-1).then(function(wtInstance) {
                            CarbonDollar.at(cdInstance).listToken(wtInstance, { from: tokenOwner })
                        })
                    })
                })
            })
        })
    })

    
};