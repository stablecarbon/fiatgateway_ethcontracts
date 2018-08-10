var RegulatorProxyFactory = artifacts.require("./RegulatorProxyFactory");
var CarbonDollar = artifacts.require("./CarbonDollar");
var CarbonDollarProxyFactory = artifacts.require("./CarbonDollarProxyFactory");

module.exports = function (deployer, network, accounts) {
    let cdTokenOwner = accounts[0];

    RegulatorProxyFactory.deployed().then(function (proxyRegulatorInstance) {
        proxyRegulatorInstance.getCount().then(function (count) {
            proxyRegulatorInstance.getRegulatorProxy(count - 2).then(function (cdRegulatorInstance) {
                  CarbonDollar.deployed().then(function(carbonDollarImplementation) {
                    CarbonDollarProxyFactory.deployed().then(function(carbonDollarProxyFactory) {
                        carbonDollarProxyFactory.createToken(carbonDollarImplementation.address, cdRegulatorInstance, {from:cdTokenOwner, gas:10000000})
                    })
                })
              })
        })
    })

    
};