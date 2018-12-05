import { getWeb3 } from '../getWeb3'
import { 
    getCusd,
    getWt0
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'

let web3 = getWeb3()

export const changeCusdFee = async () => {

    console.log('\n***** CUSD::SET_FEE() *****\n')

    let cusd = getCusd()
    let wt0 = getWt0()
    console.log('CUSD: ', cusd.options.address)
    console.log('WT0: ', wt0.options.address)

    let owner = getOwner(config.MINTER_KEY)
    console.log('Changing fee from account: ', owner.address)

    let cusd_owner = await cusd.methods.owner().call()
    console.log('CUSD owner: ', cusd_owner)
    
    if (owner.address !== cusd_owner) {
        console.log('this is not the correct CUSD owner account, exiting')
        return
    }

    let cusd_fee = await cusd.methods.getFee(wt0.options.address).call()
    console.log('CUSD current fee: ', cusd_fee)

    // @dev: change this fee!
    let new_fee = 1
    console.log('CUSD owner changing fee to: ', new_fee)

    if (new_fee === cusd_fee) {
        console.log('this fee is already the current fee, exiting')
        return
    }

    let to = cusd.options.address
    let data = cusd.methods.setFee(wt0.options.address, new_fee).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await cusd.methods.setFee(wt0.options.address, new_fee).estimateGas({ from: owner.address }))*1.2)
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

    console.log('\n***** END CUSD::SET_FEE() *****\n')

    return;
}
