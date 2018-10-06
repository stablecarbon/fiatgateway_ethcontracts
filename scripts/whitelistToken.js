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
let gasPrice = web3.toWei('30', 'gwei')
module.exports = function(callback) {

    WhitelistedTokenProxyFactory.deployed().then(wtInstance => {
        wtInstance.getToken(0).then(createdWTToken => {
            WhitelistedToken.at(createdWTToken).then(wtToken => {
                console.log("WT to add to CUSD stablecoin list: " + wtToken.address)
                wtToken.cusdAddress().then(cusd => {
                    CarbonDollar.at(cusd).then(cdToken => {
                        console.log("CUSD: " + cdToken.address)
                        cdToken.isWhitelisted(wtToken.address).then(result => {
                            if(result) {
                                console.log('CUSD has already whitelisted this token')
                                return
                            }
                            else {
                                cdToken.listToken(wtToken.address, {from:owner, gasPrice}).then(tx => {
                                    console.log("CUSD Whitelisted " + wtToken.address)
                                    return
                                })
                            }
                        })
                    })
                })
                .catch(error => {
                    console.log('WT has no CUSD reference!\nExiting...')
                    return;
                })
            })
        })
    })
}
