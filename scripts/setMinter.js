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
let WTRegulator 
let CUSDRegulator 
let gasPrice = web3.toWei('30', 'gwei')
let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
 
// ** Change REGULATOR_TYPE to change the type of new Regulator affected ** //
let REGULATOR_TYPE = "WT0"
module.exports = function(callback) {

    console.log('owner: ' + owner)

    RegulatorProxyFactory.deployed().then(instance => {
        console.log('Regulator factory: ' + instance.address)

        // Scripts for user to check Minter status of owner for regulator instances
        if (REGULATOR_TYPE == "CUSD") {
            instance.getRegulatorProxy(0).then(createdReg => {
                CarbonDollarRegulator.at(createdReg).then(cusdReg => {
                    console.log('CUSD regulator active: ' + cusdReg.address)
                    cusdReg.isMinter(owner).then(minter => {
                        if(!minter) {
                            cusdReg.setMinter(owner, { from: owner }).then(result => {
                                console.log(owner + ' ' + ' set as a CUSD Minter')
                             })
                        } else {
                            console.log(owner + ' is already a CUSD minter')
                        }
                    })

                })
            })
        } else if (REGULATOR_TYPE == "WT0") {
            instance.getRegulatorProxy(1).then(createdReg => {
                WhitelistedTokenRegulator.at(createdReg).then(wtReg => {
                    console.log('WT0 Regulator active: ' + wtReg.address)
                    wtReg.isMinter(owner).then(minter => {
                        if(!minter) {
                            wtReg.setMinter(owner, { from: owner }).then(result => {
                                console.log(owner + ' ' + ' set as a WT0 Minter')
                             })
                        } else {
                            console.log(owner + ' is already a WT0 minter')
                        }
                    })
                })
            })
        } else {
            console.log('!! No Minters added !!\nUsage: Please specify a REGULATOR_TYPE to modify a Regulator permisssions')
        }



    })
}
