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

// Useful constants
let gasPrice = web3.toWei('30', 'gwei')
 
// ** Change REGULATOR_TYPE to change the type of new Regulator created ** //
let REGULATOR_TYPE = ""
module.exports = function(callback) {

    console.log('owner: ' + owner)

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('Regulator factory: ' + instance.address)

        // Scripts for user to check Validator status of owner for regulator instances
        instance.getRegulatorProxy(0).then(createdReg => {
            CarbonDollarRegulator.at(createdReg).then(cusdReg => {
                console.log('CUSD regulator active: ' + cusdReg.address)
                cusdReg.isValidator(owner).then(result => {
                    result ? console.log('Owner is a CUSD validator') : console.log('Owner is NOT CUSD a validator')
                 })
            })
        })
        instance.getRegulatorProxy(1).then(createdReg => {
            WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
                console.log('WT0 Regulator active: ' + wtReg.address)
                wtReg.isValidator(owner).then(result => {
                    result ? console.log('Owner is a WT0 validator') : console.log('Owner is NOT a WT0 validator')
                })
            })
        })

    })
}
