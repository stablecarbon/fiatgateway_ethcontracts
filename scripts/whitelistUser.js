const contract = require("truffle-contract");

// ABI's of contracts
const RegulatorProxyFactory_abi = require('../build/contracts/RegulatorProxyFactory.json')
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')

// Addresses of contracts
const { RegulatorFactory,
        mintRecipient,
        validator } = require('./addresses')

let RegulatorProxyFactory = contract(RegulatorProxyFactory_abi);
let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);

// Set providers
RegulatorProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)

// Specific regulator addresses
let WTRegulator 
let CUSDRegulator 

module.exports = function(callback) {

    console.log('user: ' + mintRecipient)

    RegulatorProxyFactory.at(RegulatorFactory).then(instance => {

            // 1) WT Regulator whitelists user
            instance.getRegulatorProxy(0).then(createdReg => {
                WhitelistedTokenRegulator.at(createdReg).then(reg => {
                    WTRegulator = reg
                    console.log("WT Regulator: " + WTRegulator.address)
                    WTRegulator.setWhitelistedUser(mintRecipient, {from:validator}).then(() => {
                        console.log("1) WT Whitelisted user")

                        // 2) CUSD Regulator whitelists user
                        instance.getRegulatorProxy(1).then(createdCUSDReg => {
                            CarbonDollarRegulator.at(createdCUSDReg).then(CUSDreg => {
                                CUSDRegulator = CUSDreg
                                console.log("CUSD Regulator: " + CUSDRegulator.address)
                                CUSDRegulator.setWhitelistedUser(mintRecipient, {from:validator}).then(() => {
                                    console.log("2) CUSD Whitelisted user")

                                })
                            })
                        })
                    })
                })
            })
    })
}
