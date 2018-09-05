const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { WTFactory,
        CUSDFactory,
        } = require('./addresses')

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

module.exports = function(callback) {

    // CUSD tokens
    CarbonDollarProxyFactory.at(CUSDFactory).then(cusdFactory => {
        console.log('CUSD Factory: ' + cusdFactory.address)
        cusdFactory.getCount().then(count => {
            for (i = 0; i < count; i++) {
                cusdFactory.getToken(i).then(token => {
                    console.log('CUSD token #' + i + ': ' + token)
                })
            }
        })
    })

    // WT tokens
    WhitelistedTokenProxyFactory.at(WTFactory).then(wtFactory => {
        console.log('WT Factory: ' + wtFactory.address)
        wtFactory.getCount().then(count => {
            for (i = 0; i < count; i++) {
                wtFactory.getToken(i).then(token => {
                    console.log('WT token #' + i + ': ' + token)
                })
            }
        })
    })
}
