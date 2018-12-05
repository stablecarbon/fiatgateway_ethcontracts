import { getWeb3 } from '../getWeb3'
import { 
    getWt0,
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'

let web3 = getWeb3()

export const setRegulatorWt0 = async () => {

    console.log('\n***** WT0::SET_REGULATOR() *****\n')

    let wt0 = getWt0()
    console.log('WT0: ', wt0.options.address)

    let owner = getOwner(config.MINTER_KEY)
    console.log('Changing regulator from account: ', owner.address)

    let wt0_owner = await wt0.methods.owner().call()
    console.log('WT0 owner: ', wt0_owner)
    
    if (owner.address !== wt0_owner) {
        console.log('this is not the correct WT0 owner account, exiting')
        return
    }

    let wt0_regulator = await wt0.methods.regulator().call()
    console.log('WT0 current regulator: ', wt0_regulator)

    let new_regulator = config.REGULATOR_ACTIVE_ADDRESS
    console.log('WT0 owner changing regulator to: ', new_regulator)

    if (new_regulator === wt0_regulator) {
        console.log('this regulator is already the current regulator, exiting')
        return
    }

    let to = wt0.options.address
    let data = wt0.methods.setRegulator(new_regulator).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await wt0.methods.setRegulator(new_regulator).estimateGas({ from: owner.address }))*1.2)
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

    console.log('\n***** END WT0::SET_REGULATOR() *****\n')

    return;
}
