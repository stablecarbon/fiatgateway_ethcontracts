const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { owner, cusd_main, validator, cusd_test } = require('./addresses')
let cusd = cusd_main // Change for mainnet or testnet CUSD contract balance from collected txn fees

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


    // November 9 2018:
    // Minter validator has 7
    // Miles has 990
    // Contract itself has 3.003 (can be released by owner)
    // Right now, issuer should have 4 after total supply is burnt

    if(cusd == cusd_test) {
        console.log('******USING TESTNET CUSD ADDRESS: ******')
    } else if (cusd == cusd_main) {
        console.log('******USING MAINNET CUSD ADDRESS: ******')
    } else {
        console.log('!!!!!!PLEASE SPECIFY A NETWORK!!!!!!')
        return
    }

    // CUSD contract balance: stores fees and escrowed WT tokens for each CUSD outstanding
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusdInstance => {
                cusdInstance.balanceOf(cusd).then(cusdBalance => {
                    console.log("==TOKEN==\nCUSD Balance of CUSD contract: " + cusdBalance/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.balanceOf(cusd).then(wtBalance => {
                    console.log("==TOKEN==\nWT0 Balance of CUSD contract: " + wtBalance/conversion)
                })
            })
        })
    })

    // Owner balance
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                cusd.balanceOf(owner).then(cusdBalance => {
                    console.log("==USER==\nCUSD Balance of owner: " + cusdBalance/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.balanceOf(owner).then(wtBalance => {
                    console.log("==USER==\nWT0 Balance of owner: " + wtBalance/conversion)
                })
            })
        })
    })

    // validator balance
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                cusd.balanceOf(validator).then(cusdBalance => {
                    console.log("==USER==\nCUSD Balance of validator/minter: " + cusdBalance/conversion)
                })
            })
        })
    })
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.balanceOf(validator).then(wtBalance => {
                    console.log("==USER==\nWT0 Balance of validator/minter: " + wtBalance/conversion)
                })
            })
        })
    })
}
