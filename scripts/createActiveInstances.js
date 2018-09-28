const contract = require("truffle-contract");

// ABI's of contracts
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')
const RegulatorProxyFactory_abi = require('../build/contracts/RegulatorProxyFactory.json')

// Addresses of contracts
const { 
        mintRecipient,
        minterCUSD,
        validator,
        newOwner, oldOwner, owner } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)
let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);
let RegulatorProxyFactory = contract(RegulatorProxyFactory_abi);

// Set providers
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)
RegulatorProxyFactory.setProvider(web3.currentProvider)

// Specific regulator addresses
let WTRegulator 
let CUSDRegulator 
let WT0
let CUSD
let who = oldOwner
let gasPrice = web3.toWei('30', 'gwei')
let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = function(callback) {

    console.log('owner: ' + who)

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('Regulator factory: ' + instance.address)

        // instance.getRegulatorProxy(0).then(createdReg => {
        //     CarbonDollarRegulator.at(createdReg).then(cusdReg => {
        //         console.log('CUSD regulator active: ' + cusdReg.address)
        //         cusdReg.owner().then(owner => { console.log('CUSD regulator current owner: ' + owner)})
        //         cusdReg.pendingOwner().then(pending => { console.log('CUSD regulator pending owner: ' + pending)})
        //         // cusdReg.transferOwnership(newOwner, { from: who, gasPrice})
        //         // cusdReg.claimOwnership({ from: who, gasPrice})
        //     })
            CarbonDollarProxyFactory.deployed().then(cusdFactory => {
                console.log('CUSD factory: ' + cusdFactory.address)
                cusdFactory.getCount().then(count => {
                    console.log('CUSD factory count: ' + count)
                })
                // CarbonDollar.deployed().then(cusdLogic => {
                //     console.log('CUSD token logic: ' + cusdLogic.address)
                //     // cusdFactory.createToken(cusdLogic.address, createdReg, {from:who})
                // })
                // cusdFactory.getToken(0).then(cusdAddress => {
                //     CarbonDollar.at(cusdAddress).then(cusd => {
                //         console.log('CUSD token active: ' + cusdAddress)
                //         cusd.owner().then(owner => { console.log('CUSD token current owner: ' + owner)})
                //         cusd.pendingOwner().then(pending => { console.log('CUSD token pending owner: ' + pending)})
                //         cusd.regulator().then(regulator => { console.log('CUSD token regulator: ' + regulator)})
                //         // cusd.claimOwnership({ from: newOwner, gasPrice})
                //     })
                // })
            })
        // })

        // instance.getRegulatorProxy(1).then(createdReg => {
        //     WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
        //         console.log('WT0 Regulator active: ' + wtReg.address)
        //         wtReg.owner().then(owner => { console.log('WT regulator current owner: ' + owner)})
        //         wtReg.pendingOwner().then(pending => { console.log('WT regulator pending owner: ' + pending)})
        //     })
            WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
                console.log('WT0 factory: ' + wtFactory.address)
                // wtFactory.getToken(0).then(wtAddress => {
                //     WhitelistedToken.at(wtAddress).then(wt => {
                //         console.log('WT0 token active: ' + wtAddress)
                //         wt.owner().then(owner => { console.log('WT token current owner: ' + owner)})
                //         wt.pendingOwner().then(pending => { console.log('WT token pending owner: ' + pending)})
                //         wt.regulator().then(regulator => { console.log('WT token regulator: ' + regulator)})
                //         // wt.claimOwnership({ from: who , gasPrice })
                //     })
                // })
                wtFactory.getCount().then(count => {
                    console.log('WT0 factory count: ' + count)
                })
                // WhitelistedToken.deployed().then(wt0logic => {
                //     console.log('WT0 token logic: ' + wt0logic.address)
                //     CarbonDollarProxyFactory.deployed().then(cusdFactory => {
                //         cusdFactory.getToken(0).then(cusdInstance => {
                //             // wtFactory.createToken(wt0logic.address, cusdInstance, createdReg, { from: who })
                //         })
                //     })
                    
                // })
            })
        // })
        instance.getCount().then(count => {
            console.log('Regulator factory count: ' + count)
        })
        CarbonDollarRegulator.deployed().then(function (carbonDollarRegulatorInstance) {
              console.log('CUSD regulator logic: ' + carbonDollarRegulatorInstance.address)
              instance.createRegulatorProxy(carbonDollarRegulatorInstance.address, { from: who})
              // carbonDollarRegulatorInstance.transferOwnership(newOwner, { from: oldOwner, gasPrice})
              // carbonDollarRegulatorInstance.claimOwnership({ from: newOwner })
          })
        WhitelistedTokenRegulator.deployed().then(function (whitelistedTokenRegulatorInstance) {
            console.log('WT0 regulator logic: ' + whitelistedTokenRegulatorInstance.address)
            // instance.createRegulatorProxy(whitelistedTokenRegulatorInstance.address, { from: who })
            // whitelistedTokenRegulatorInstance.transferOwnership(newOwner, { from: oldOwner, gasPrice })
            // whitelistedTokenRegulatorInstance.claimOwnership({ from: newOwner })
        })

    })
}
