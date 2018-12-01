const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { owner, cusd_main, validator, cusd_test } = require('./addresses')
let cusd = cusd_test // Change for mainnet or testnet CUSD contract balance from collected txn fees

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
let conversion = 10**18
module.exports = function(callback) {

    if(cusd == cusd_test) {
        console.log('******TESTNET: ')
    } else if (cusd == cusd_main) {
        console.log('******MAINNET: ')
    } else {
        console.log('PLEASE SPECIFY A NETWORK')
    }

    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusdInstance => {
                cusdInstance.totalSupply().then(supply => {
                    console.log("==TOKEN==\nCUSD total supply (" + cusdAddress + ") : " + supply/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.totalSupply().then(supply => {
                    console.log("==TOKEN==\nWT0 total supply (" + wtAddress + ") : " + supply/conversion)
                })
            })
        })
    })
}
