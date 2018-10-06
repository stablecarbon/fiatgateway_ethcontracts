const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { owner } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)

// Set providers
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)


// Constants
let FEE = 1 // 10ths of a percent, so fee=1 = 0.1%
let gasPrice = web3.toWei('25', 'gwei')

module.exports = function(callback) {

    WhitelistedTokenProxyFactory.deployed().then(wtInstance => {
        wtInstance.getToken(0).then(createdWTToken => {
            WhitelistedToken.at(createdWTToken).then(wtToken => {
                console.log("WT: " + wtToken.address)
                wtToken.cusdAddress().then(cusd => {
                    CarbonDollar.at(cusd).then(cdToken => {
                        console.log("CUSD: " + cdToken.address)
                        cdToken.getFee(wtToken.address).then(fee => {
                            console.log('CUSD Fee for redeeming ' + wtToken.address + ': ' + '%' + fee/10)

                            // To set a stablecoin fee, the WT must first be whitelisted by this CUSD instance
                            cdToken.setFee(wtToken.address, FEE, {from:owner, gasPrice}).then(tx => {
                                console.log('Changed CUSD fee for ' + wtToken.address + ' to ' + '%' + FEE/10)
                            })
                        })
                    })
                })
            })
        })
    })
}
