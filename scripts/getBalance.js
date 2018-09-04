const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { WTFactory,
        CUSDFactory,
        mintRecipient,
        minterCUSD } = require('./addresses')

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

    console.log('user: ' + mintRecipient)

    // CUSD balance
    CarbonDollarProxyFactory.at(CUSDFactory).then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                CUSD = cusd
                CUSD.balanceOf(mintRecipient).then(cusdBalance => {
                    console.log("CUSD Balance: " + cusdBalance)
                })
            })
        })
    })

    // WT0 balance
    WhitelistedTokenProxyFactory.at(WTFactory).then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                WT0 = wt
                WT0.balanceOf(mintRecipient).then(wtBalance => {
                    console.log("WT0 Balance: " + wtBalance)
                })
            })
        })
    })
}
