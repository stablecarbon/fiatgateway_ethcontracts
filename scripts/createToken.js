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
const { owner } = require('./addresses')

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
let gasPrice = web3.toWei('30', 'gwei')
let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
 
// ** Change TOKEN_TYPE to change the type of new Regulator created ** //
let TOKEN_TYPE = ""
module.exports = function(callback) {

    console.log('owner: ' + owner)

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('Regulator factory: ' + instance.address)

        // CUSD Token
        instance.getRegulatorProxy(0).then(cusdReg => {
            CarbonDollarProxyFactory.deployed().then(cusdFactory => {
                console.log('CUSD factory: ' + cusdFactory.address)
                cusdFactory.getCount().then(count => {
                    console.log('CUSD factory count: ' + count)
                })
                CarbonDollar.deployed().then(cusdLogic => {
                    if (TOKEN_TYPE == "CUSD") {
                        console.log('Please wait...creating a new CUSD')
                        cusdFactory.createToken(cusdLogic.address, cusdReg, {from:owner, gasPrice}).then(result => {
                            console.log('Created new CUSD')
                        })
                    }
                })

                // Scripts to claim ownership of token contracts
                cusdFactory.getToken(0).then(cusdAddress => {
                    CarbonDollar.at(cusdAddress).then(cusd => {
                        console.log('CUSD token active: ' + cusdAddress)
                        cusd.owner().then(owner => { console.log('CUSD token current owner: ' + owner)})
                        cusd.pendingOwner().then(pending => { console.log('CUSD token pending owner: ' + pending)})
                        cusd.regulator().then(regulator => { console.log('CUSD token regulator: ' + regulator)})
                        // cusd.claimOwnership({ from: owner, gasPrice}).then(result => {
                        //     console.log(owner + ' claimed ownership of CUSD')
                        // })
                    })
                })
            })
        })

        // WT0 Token
        instance.getRegulatorProxy(1).then(wtReg => {
            WhitelistedTokenProxyFactory.deployed().then(wtFactory => {
                console.log('WT0 factory: ' + wtFactory.address)
                wtFactory.getCount().then(count => {
                    console.log('WT0 factory count: ' + count)
                })
                WhitelistedToken.deployed().then(wt0logic => {
                    CarbonDollarProxyFactory.deployed().then(cusdFactory => {
                        // Link active CUSD contract with new WT0 instance
                        cusdFactory.getToken(0).then(cusdInstance => {
                            if (TOKEN_TYPE == "WT0") {
                                console.log('Please wait...creating a new WT0')
                                wtFactory.createToken(wt0logic.address, cusdInstance, wtReg, { from: owner, gasPrice }).then(result => {
                                    console.log('Created new WT0')
                                })
                            }
                        })
                    })                    
                })

                // Scripts to claim ownership of token contracts
                wtFactory.getToken(0).then(wtAddress => {
                    WhitelistedToken.at(wtAddress).then(wt => {
                        console.log('WT0 token active: ' + wtAddress)
                        wt.owner().then(owner => { console.log('WT token current owner: ' + owner)})
                        wt.pendingOwner().then(pending => { console.log('WT token pending owner: ' + pending)})
                        wt.regulator().then(regulator => { console.log('WT token regulator: ' + regulator)})
                        // wt.claimOwnership({ from: owner , gasPrice }).then(result => {
                        //     console.log(owner + ' claimed ownership of WT0')
                        // })
                    })
                })
        
            })
        })
    })
}
