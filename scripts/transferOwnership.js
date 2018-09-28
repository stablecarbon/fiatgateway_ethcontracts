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
// WhitelistedTokenRegulator.setProvider(web3.currentProvider)
// CarbonDollarRegulator.setProvider(web3.currentProvider)
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
// CarbonDollar.setProvider(web3.currentProvider)
// WhitelistedToken.setProvider(web3.currentProvider)
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

    console.log('user: ' + who)

    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        console.log('wt factory: ' + wtFactory.address)
        // wtFactory.getToken(0).then(wtAddress => {
        //     WhitelistedToken.at(wtAddress).then(wt => {
        //         console.log('WT: ' + wtAddress)
        //         wt.owner().then(owner => { console.log('WT current owner: ' + owner)})
        //         wt.pendingOwner().then(pending => { console.log('WT pending owner: ' + pending)})
        //         wt.regulator().then(regulator => { console.log('WT regulator: ' + regulator)})
        //         // wt.claimOwnership({ from: newOwner , gasPrice })
        //     })
        // })
    })


    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        console.log('cusd factory: ' + cusdFactory.address)
        // cusdFactory.getToken(0).then(cusdAddress => {
        //     CarbonDollar.at(cusdAddress).then(cusd => {
        //         console.log('CUSD: ' + cusdAddress)
        //         cusd.owner().then(owner => { console.log('CUSD current owner: ' + owner)})
        //         cusd.pendingOwner().then(pending => { console.log('CUSD pending owner: ' + pending)})
        //         cusd.regulator().then(regulator => { console.log('CUSD regulator: ' + regulator)})
        //         // cusd.claimOwnership({ from: newOwner, gasPrice})
        //     })
        // })
    })

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('regulator factory: ' + instance.address)
        // instance.getRegulatorProxy(0).then(createdReg => {
        //     CarbonDollarRegulator.at(createdReg).then(cusdReg => {
        //         console.log('CUSD Regulator: ' + cusdReg.address)
        //         cusdReg.owner().then(owner => { console.log('CUSD regulator current owner: ' + owner)})
        //         cusdReg.pendingOwner().then(pending => { console.log('CUSD regulator pending owner: ' + pending)})
        //         // cusdReg.transferOwnership(newOwner, { from: who, gasPrice})
        //         // cusdReg.claimOwnership({ from: who, gasPrice})
        //     })
        // })
        // instance.getRegulatorProxy(1).then(createdReg => {
        //     WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
        //         console.log('WT Regulator: ' + wtReg.address)
        //         wtReg.owner().then(owner => { console.log('WT regulator current owner: ' + owner)})
        //         wtReg.pendingOwner().then(pending => { console.log('WT regulator pending owner: ' + pending)})
        //     })
        // })
    })
}
