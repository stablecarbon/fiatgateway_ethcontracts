var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var WhitelistedToken = artifacts.require("./CarbonDollar");
var WhitelistedTokenProxyFactory = artifacts.require("./WhitelistedTokenProxyFactory");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");

module.exports = function (deployer, network, accounts) {
    let wtTokenOwner = accounts[0];

    CarbonDollarProxyFactory.deployed().then(function (proxyCDInstance) {
        proxyCDInstance.getCount().then(function (count) {
            proxyCDInstance.getToken(count-1).then(function (cdInstance) {
                RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
                    proxyRegulatorInstance.getCount().then(function (count) {
                        proxyRegulatorInstance.getRegulatorProxy(count - 1).then(function (wtRegulatorInstance) {
                              WhitelistedToken.deployed().then(function(wtImplementation) {
                                WhitelistedTokenProxyFactory.deployed().then(function(wtProxyFactory) {
                                    wtProxyFactory.createToken(wtImplementation.address, cdInstance, wtRegulatorInstance, {from:wtTokenOwner})
                                })
                            })
                          })
                    })
                })
            })
        })
    })



};
