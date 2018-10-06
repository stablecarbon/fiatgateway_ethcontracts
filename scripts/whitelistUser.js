const contract = require("truffle-contract");

// ABI's of contracts
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')
const RegulatorProxyFactory_abi = require('../build/contracts/RegulatorProxyFactory.json')

// Addresses of contracts
const { owner } = require('./addresses')

let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);
let RegulatorProxyFactory = contract(RegulatorProxyFactory_abi);

// Set providers
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)
RegulatorProxyFactory.setProvider(web3.currentProvider)

// Specific regulator addresses
let gasPrice = web3.toWei('30', 'gwei')
 
// ** Change REGULATOR_TYPE to change the type of new Regulator affected ** //
let REGULATOR_TYPE = ""
module.exports = function(callback) {

    console.log('owner: ' + owner)

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('Regulator factory: ' + instance.address)

        // Scripts for user to check Whitelist status of owner for regulator instances
        instance.getRegulatorProxy(0).then(createdReg => {
            CarbonDollarRegulator.at(createdReg).then(cusdReg => {
                console.log('CUSD regulator active: ' + cusdReg.address)
                cusdReg.isWhitelistedUser(owner).then(whitelisted => {
                    if(!whitelisted) {
                        if (REGULATOR_TYPE == "CUSD") {
                            cusdReg.setWhitelistedUser(owner, { from: owner, gasPrice }).then(result => {
                                console.log(owner + ' whitelisted on CUSD')
                             })
                        }
                    } else {
                        console.log(owner + ' is already whitelisted on CUSD')
                    }
                })

            })
        })
        instance.getRegulatorProxy(1).then(createdReg => {
            WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
                console.log('WT0 Regulator active: ' + wtReg.address)
                wtReg.isWhitelistedUser(owner).then(whitelisted => {
                    if(!whitelisted) {
                        if (REGULATOR_TYPE == "WT0") {
                            wtReg.setWhitelistedUser(owner, { from: owner, gasPrice }).then(result => {
                                console.log(owner + ' whitelisted on WT0')
                             })
                        }
                    } else {
                        console.log(owner + ' is already whitelisted on WT0')
                    }
                })
            })
        })



    })
}
