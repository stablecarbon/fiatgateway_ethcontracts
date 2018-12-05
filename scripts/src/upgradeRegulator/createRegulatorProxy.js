import { getWeb3 } from '../getWeb3'
import { 
    getRegulatorFactory,
    getRegulatorCount,
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'
let web3 = getWeb3()

export const createRegulatorProxy = async () => {

    console.log('\n***** REGULATOR::CREATE_REGULATOR() *****\n')

    console.log("Using web3 version: ", web3.version)

    let reg_factory = getRegulatorFactory()
    console.log('Regulator factory: ', reg_factory.options.address)

    let reg_count = await getRegulatorCount()
    console.log('Regulator count: ', reg_count)

    for (var i = 0; i < reg_count; i++) {
        var instance = await reg_factory.methods.getRegulatorProxy(i).call()
        console.log('Regulator factory ' + i + 'th regulator proxy: ' + instance)
    }

    /** CREATE A NEW REGULATOR PROXY FROM FACTORY **/
    let owner = getOwner()
    console.log("Creating a new Regulator proxy from: ", owner.address)
    let regulator_model_address = config.REGULATOR_MODEL_ADDRESS
    console.log("Using Regulator model: ", regulator_model_address)
    
    /** 1. Constructing and sending createRegulatorProxy transaction **/
    let to = config.REGULATOR_FACTORY_ADDRESS
    let data = reg_factory.methods.createRegulatorProxy(regulator_model_address).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await reg_factory.methods.createRegulatorProxy(regulator_model_address).estimateGas({ from: owner.address }))*1.2)
    console.log('Estimated gas cost: ', gas)
    let tx = {
        to,
        data,
        gasPrice,
        gas
    }
    try {
        let sig = await owner.signTransaction(tx)
        let receipt = await web3.eth.sendSignedTransaction(sig.rawTransaction)
        console.log('transaction receipt: ', receipt.transactionHash)
    } catch(err) {
        console.log(err)
    }

    console.log('\n***** END REGULATOR::CREATE_REGULATOR() *****\n')
    return;
}
