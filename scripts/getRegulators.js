const contract = require("truffle-contract");

// ABI's of contracts
const RegulatorProxyFactory_abi = require('../build/contracts/RegulatorProxyFactory.json')

// Addresses of contracts
const { 
        mintRecipient,
        minterCUSD,
        validator } = require('./addresses')

let RegulatorProxyFactory = contract(RegulatorProxyFactory_abi);

// Specific regulator addresses
let WTRegulator 
let CUSDRegulator 

RegulatorProxyFactory.setProvider(web3.currentProvider)

module.exports = function(callback) {

    RegulatorProxyFactory.deployed().then(instance => {

        // 1) CUSD Regulator 
        instance.getRegulatorProxy(0).then(createdReg => {
            console.log('CUSD Regulator: ' + createdReg)
        })
        // 2) WT Regulator 
        instance.getRegulatorProxy(1).then(createdReg => {
            console.log('WT Regulator: ' + createdReg)
        })
    })
}
