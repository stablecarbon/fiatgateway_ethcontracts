import { getWeb3 } from '../getWeb3'
import { 
    getCusd,
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

let web3 = getWeb3()

export const setRegulatorCusd = async () => {

    console.log('\n***** CUSD::SET_REGULATOR() *****\n')

    let cusd = getCusd()
    console.log('CUSD: ', cusd.options.address)

    // Ropsten token owner is 0xf886...
    let owner = getOwner(process.env.MINTER_KEY)
    console.log('Changing regulator from account: ', owner.address)

    let cusd_owner = await cusd.methods.owner().call()
    console.log('CUSD owner: ', cusd_owner)
    
    if (owner.address !== cusd_owner) {
        console.log('this is not the correct CUSD owner account, exiting')
        return
    }

    let cusd_regulator = await cusd.methods.regulator().call()
    console.log('CUSD current regulator: ', cusd_regulator)

    let new_regulator = config.REGULATOR_ACTIVE_ADDRESS
    console.log('CUSD owner changing regulator to: ', new_regulator)

    if (new_regulator === cusd_regulator) {
        console.log('this regulator is already the current regulator, exiting')
        return
    }

    let to = cusd.options.address
    let data = cusd.methods.setRegulator(new_regulator).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await cusd.methods.setRegulator(new_regulator).estimateGas({ from: owner.address }))*1.2)
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

    console.log('\n***** END CUSD::SET_REGULATOR() *****\n')

    return;
}
