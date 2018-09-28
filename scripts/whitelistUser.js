const contract = require("truffle-contract");

// ABI's of contracts
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')

// Addresses of contracts
const { 
        mintRecipient,
        minterCUSD,
        validator,
        owner,
        cusdAddress } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)
let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);

// Set providers
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)

// Specific regulator addresses
let WTRegulator 
let CUSDRegulator 
let WT0
let CUSD
let who = owner
let gasPrice = web3.toWei('25', 'gwei')

module.exports = function(callback) {

    console.log('user: ' + who)

    // WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
    //     wtFactory.getToken(0).then(wtAddress => {
    //         WhitelistedToken.at(wtAddress).then(wt => {
    //             WT0 = wt
    //             WT0.regulator().then(wtRegulatorAddress => {
    //                 WhitelistedTokenRegulator.at(wtRegulatorAddress).then(wtRegulator => {
    //                     WTRegulator = wtRegulator
    //                     console.log("WT Regulator: " + WTRegulator.address)
    //                     WTRegulator.isWhitelistedUser(cusdAddress).then(whitelisted => {
    //                         if(!whitelisted) {
    //                             WTRegulator.setWhitelistedUser(cusdAddress, {from:who, gasPrice}).then(() => {
    //                                 console.log("Whitelisted user on WT")
    //                             })
    //                         }
    //                         else {
    //                             console.log("User already WT Whitelisted!")
    //                         }
    //                     })
    //                     .catch(error => {
    //                         console.log(error.message)
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // })

    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                CUSD = cusd
                CUSD.regulator().then(cusdRegulatorAddress => {
                    CarbonDollarRegulator.at(cusdRegulatorAddress).then(cusdRegulator => {
                        CUSDRegulator = cusdRegulator
                        console.log("CUSD Regulator: " + CUSDRegulator.address)
                        CUSDRegulator.isWhitelistedUser(cusdAddress).then(whitelisted => {
                            if(!whitelisted) {
                                CUSDRegulator.setWhitelistedUser(cusdAddress, {from:who, gasPrice}).then(() => {
                                    console.log("Whitelisted user on CUSD")
                                })
                            }
                            else {
                                console.log("User already CUSD whitelisted!")
                            }
                        })
                        .catch(error => {
                            console.log(error.message)
                        })
                    })
                })
            })
        })
    })
}
