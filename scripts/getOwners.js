const contract = require("truffle-contract");

// ABI's of contracts
const CarbonDollarProxyFactory_abi = require('../build/contracts/CarbonDollarProxyFactory.json')
const WhitelistedTokenProxyFactory_abi = require('../build/contracts/WhitelistedTokenProxyFactory.json')
const CarbonDollar_abi = require('../build/contracts/CarbonDollar.json')
const WhitelistedToken_abi = require('../build/contracts/WhitelistedToken.json')
const WhitelistedTokenRegulator_abi = require('../build/contracts/WhitelistedTokenRegulator.json')
const CarbonDollarRegulator_abi = require('../build/contracts/CarbonDollarRegulator.json')
const RegulatorProxyFactory_abi = require('../build/contracts/RegulatorProxyFactory.json')

// Addresses of contracts
const { owner, cusd } = require('./addresses')

let CarbonDollarProxyFactory = contract(CarbonDollarProxyFactory_abi);
let WhitelistedTokenProxyFactory = contract(WhitelistedTokenProxyFactory_abi);
let CarbonDollar = contract(CarbonDollar_abi)
let WhitelistedToken = contract(WhitelistedToken_abi)
let WhitelistedTokenRegulator = contract(WhitelistedTokenRegulator_abi);
let CarbonDollarRegulator = contract(CarbonDollarRegulator_abi);
let RegulatorProxyFactory = contract(RegulatorProxyFactory_abi);

// Set providers
CarbonDollarProxyFactory.setProvider(web3.currentProvider)
WhitelistedTokenProxyFactory.setProvider(web3.currentProvider)
CarbonDollar.setProvider(web3.currentProvider)
WhitelistedToken.setProvider(web3.currentProvider)
WhitelistedTokenRegulator.setProvider(web3.currentProvider)
CarbonDollarRegulator.setProvider(web3.currentProvider)
RegulatorProxyFactory.setProvider(web3.currentProvider)

// Specific token addresses
let WT0
let CUSD
let conversion = 10**18
module.exports = function(callback) {

    RegulatorProxyFactory.deployed().then(regFactory => {
        regFactory.getRegulatorProxy(0).then(cusdReg => {
            CarbonDollarRegulator.at(cusdReg).then(reg => {
                reg.owner().then(owner => {
                    console.log('CUSD regulator active: ' + owner)
                })
            })
        })
        CarbonDollarRegulator.deployed().then(regLogic => {
            regLogic.owner().then(owner => {
                console.log('CUSD regulator logic: ' + owner)
            })
        })
        regFactory.getRegulatorProxy(1).then(wt0Reg => {
            WhitelistedTokenRegulator.at(wt0Reg).then(reg => {
                reg.owner().then(owner => {
                    console.log('WT0 regulator active: ' + owner)
                })
            })
        })
        WhitelistedTokenRegulator.deployed().then(regLogic => {
            regLogic.owner().then(owner => {
                console.log('WT0 regulator logic: ' + owner)
            })
        })
    })
    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
        cusdFactory.getToken(0).then(cusdAddress => {
            CarbonDollar.at(cusdAddress).then(cusd => {
                cusd.owner().then(owner => {
                    console.log('CUSD active: ' + owner)
                })
            })
        })
    })
    CarbonDollar.deployed().then(cusdLogic => {
        cusdLogic.owner().then(owner => {
            console.log('CUSD logic: ' + owner)
        })
    })    
    WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
        wtFactory.getToken(0).then(wtAddress => {
            WhitelistedToken.at(wtAddress).then(wt => {
                wt.owner().then(owner => {
                    console.log('WT0 active: ' + owner)
                })
            })
        })
    })
    WhitelistedToken.deployed().then(wt0Logic => {
        wt0Logic.owner().then(owner => {
            console.log('WT0 logic: ' + owner)
        })
    })   
}
