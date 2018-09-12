var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");
var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");
var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");
var CarbonDollar = artifacts.require("./CarbonDollar");

// OPTIONAL: This is a script to set up regulators + tokens to work properly out of the box
// Claim ownership of all contracts, set up regulators initially so that WT and CUSD are interchangeable
module.exports = function (deployer, network, accounts) {
    let tokenOwner = accounts[0]; 
    // creator of regulators should be a validator as well, see RegulatorProxyFactory.sol which uses ValidatorSheetMock to add an initial validator

    // Both WT and CD regulators need to whitelist CD for conversion
    // First, claim ownership of contracts
    CarbonDollarProxyFactory.deployed().then(function (proxyCDInstance) {
        proxyCDInstance.getCount().then(function (countToken) {
            proxyCDInstance.getToken(countToken-1).then(function (cdInstance) {
                RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
                    proxyRegulatorInstance.getCount().then(function (count) {
                        proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
                            proxyRegulatorInstance.getRegulatorProxy(count - 2).then(function (cdRegulatorInstance) {
                                CarbonDollarRegulator.at(cdRegulatorInstance).setWhitelistedUser(cdInstance, {from:tokenOwner}).then(function () {
                                    WhitelistedTokenRegulator.at(wtRegulatorInstance).setWhitelistedUser(cdInstance, {from:tokenOwner}).then(function () {
                                        CarbonDollarRegulator.at(cdRegulatorInstance).setMinter(tokenOwner, {from:tokenOwner}).then(function () {
                                            WhitelistedTokenRegulator.at(wtRegulatorInstance).setMinter(tokenOwner, {from:tokenOwner})
                                        })
                                    })
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