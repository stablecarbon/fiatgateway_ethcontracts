const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { 
        mintRecipient,
        validator,
        minterCUSD,
        owner } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)

// Set providers
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)

// Specific token addresses
let WT0
let CUSD

// Constants
let gas = 7000000
let gasPrice = 30000000000

module.exports = function(callback) {

    WhitelistedTokenProxyFactory.deployed().then(wtInstance => {
        wtInstance.getToken(0).then(createdWTToken => {
            WhitelistedToken.at(createdWTToken).then(wtToken => {
                WT0 = wtToken
                console.log("WT: " + WT0.address)
                WT0.cusdAddress().then(cusd => {
                    CarbonDollar.at(cusd).then(cdToken => {
                        CUSD = cdToken
                        console.log("CUSD: " + CUSD.address)
                        CUSD.listToken(WT0.address, {from:owner, gas, gasPrice}).then(tx => {
                            console.log("Whitelisted WT Stablecoin!")
                            console.log(tx)
                        })
                    })
                })
            })
        })
    })
}
