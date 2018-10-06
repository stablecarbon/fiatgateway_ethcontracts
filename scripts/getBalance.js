const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { owner, cusd } = require('./addresses')

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

    // CUSD contract balance: stores fees and escrowed WT tokens for each CUSD outstanding
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusdInstance => {
                cusdInstance.balanceOf(cusd).then(cusdBalance => {
                    console.log("==TOKEN==\nCUSD Balance of " + cusd + " : " + cusdBalance/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.balanceOf(cusd).then(wtBalance => {
                    console.log("==TOKEN==\nWT0 Balance of " + cusd + " : " + wtBalance/conversion)
                })
            })
        })
    })

    // Owner balance
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                cusd.balanceOf(owner).then(cusdBalance => {
                    console.log("==USER==\nCUSD Balance of " + owner + " : " + cusdBalance/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.balanceOf(owner).then(wtBalance => {
                    console.log("==USER==\nWT0 Balance of " + owner + " : " + wtBalance/conversion)
                })
            })
        })
    })
}
