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
let gasPrice = web3.toWei('25', 'gwei')
let amountToMint = 1000
let conversion = 10**18 // precision is like ETH and goes out to 18 decimals

module.exports = function(callback) {

    console.log('Who to mint coins to: ' + owner)

    WhitelistedTokenProxyFactory.deployed().then(wtInstance => {
        wtInstance.getToken(0).then(createdWTToken => {
            WhitelistedToken.at(createdWTToken).then(wtToken => {
                console.log("WT: " + wtToken.address)
                wtToken.regulator().then(wtRegulatorAddress => {
                    WhitelistedTokenRegulator.at(wtRegulatorAddress).then(wtRegulator => {
                        wtRegulator.isMinter(owner).then(minterWT0 => {
                            if(!minterWT0) {
                                console.log('Owner is not a Minter on WT0')
                                return;
                            } else {
                                wtToken.cusdAddress().then(cusd => {
                                    CarbonDollar.at(cusd).then(cdToken => {
                                        console.log("CUSD: " + cdToken.address)
                                        cdToken.regulator().then(cdRegulatorAddress => {
                                            CarbonDollarRegulator.at(cdRegulatorAddress).then(cdRegulator => {
                                                cdRegulator.isMinter(owner).then(minterCUSD => {
                                                    if(!minterCUSD) {
                                                        console.log('Owner is not a Minter on CUSD')
                                                        return;
                                                    } else {
                                                        console.log('Minter verified, minting ' + amountToMint + ' CUSD...')
                                                        wtToken.mintCUSD(owner, amountToMint*conversion, {from:owner,  gasPrice}).then(tx => {
                                                            let mintCUSDEvent = tx.logs[tx.logs.length-1]
                                                            console.log("Minted to " + owner + " : amount = " + mintCUSDEvent.args.amount/conversion)
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
