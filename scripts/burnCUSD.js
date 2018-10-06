const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')

// Addresses of contracts
const { owner } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)
let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);

// Set providers
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)


// Constants
let gasPrice = web3.toWei('35', 'gwei')
let amountToRedeem = 2000
let conversion = 10**18 // precision is like ETH and goes out to 18 decimals

module.exports = function(callback) {

    console.log('Who is redeeming coins: ' + owner)

    WhitelistedTokenProxyFactory.deployed().then(wtInstance => {
        wtInstance.getToken(0).then(createdWTToken => {
            WhitelistedToken.at(createdWTToken).then(wtToken => {
                console.log("WT: " + wtToken.address)
                wtToken.regulator().then(wtRegulatorAddress => {
                    WhitelistedTokenRegulator.at(wtRegulatorAddress).then(wtRegulator => {
                        wtRegulator.isWhitelistedUser(owner).then(whitelistedWT0 => {
                            if(!whitelistedWT0) {
                                console.log('Owner is not Whitelisted on WT0')
                                return;
                            } else {
                                wtToken.cusdAddress().then(cusd => {
                                    CarbonDollar.at(cusd).then(cdToken => {
                                        console.log("CUSD: " + cdToken.address)
                                        cdToken.regulator().then(cdRegulatorAddress => {
                                            CarbonDollarRegulator.at(cdRegulatorAddress).then(cdRegulator => {
                                                cdRegulator.isWhitelistedUser(owner).then(whitelistedCUSD => {
                                                    if(!whitelistedCUSD) {
                                                        console.log('Owner is not Whitelisted on on CUSD')
                                                        return;
                                                    } else {
                                                        console.log('User whitelist verified, redeeming ' + amountToRedeem + ' CUSD...')
                                                        cdToken.burnCarbonDollar(wtToken.address, amountToRedeem*conversion, {from:owner,  gasPrice}).then(tx => {
                                                            let burnCUSDEvent = tx.logs[tx.logs.length-1]
                                                            console.log("Burned from " + owner + " : amount = " + burnCUSDEvent.args.feedAmount/conversion + ", charged a fee of " + burnCUSDEvent.args.chargedFee/conversion)
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            }
                        })
                    })
                })
            })
        })
    })
}
