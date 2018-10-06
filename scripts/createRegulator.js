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

        // Scripts for user to claimOwnership of regulator instances
        // When ownership is claimed, there should no longer be a Regulator.pendingOwner
        instance.getRegulatorProxy(0).then(createdReg => {
            CarbonDollarRegulator.at(createdReg).then(cusdReg => {
                console.log('CUSD regulator active: ' + cusdReg.address)
                cusdReg.owner().then(owner => { console.log('CUSD regulator current owner: ' + owner)})
                cusdReg.pendingOwner().then(pending => { console.log('CUSD regulator pending owner: ' + pending)})
                // cusdReg.claimOwnership({ from: owner, gasPrice})
            })
        })
        instance.getRegulatorProxy(1).then(createdReg => {
            WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
                console.log('WT0 Regulator active: ' + wtReg.address)
                wtReg.owner().then(owner => { console.log('WT regulator current owner: ' + owner)})
                wtReg.pendingOwner().then(pending => { console.log('WT regulator pending owner: ' + pending)})
                // wtReg.claimOwnership({ from: owner, gasPrice })
            })
        })

        instance.getCount().then(count => {
            console.log('Regulator factory count: ' + count)
        })

        if (REGULATOR_TYPE == "CUSD") {
         CarbonDollarRegulator.deployed().then(function (carbonDollarRegulatorInstance) {
              console.log('CUSD regulator logic: ' + carbonDollarRegulatorInstance.address)
              instance.createRegulatorProxy(carbonDollarRegulatorInstance.address, { from: owner})
          })
        } else if (REGULATOR_TYPE == "WT0") {
            WhitelistedTokenRegulator.deployed().then(function (whitelistedTokenRegulatorInstance) {
                console.log('WT0 regulator logic: ' + whitelistedTokenRegulatorInstance.address)
                instance.createRegulatorProxy(whitelistedTokenRegulatorInstance.address, { from: owner })
            })
        } else {
            console.log('!! No Regulator created !!\nUsage: Please specify a REGULATOR_TYPE to create a new Regulator')
        }


    })
}
