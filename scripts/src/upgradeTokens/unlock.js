import { getWeb3 } from '../getWeb3'
import { 
    getCusd
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'

let web3 = getWeb3()

export const unlock = async () => {

    console.log('\n***** CUSD::UNLOCK() *****\n')

    let cusd = getCusd()
    console.log('CUSD: ', cusd.options.address)

    let owner = getOwner(config.MINTER_KEY)
    console.log('Unlocking from account: ', owner.address)

    let cusd_owner = await cusd.methods.owner().call()
    console.log('CUSD owner: ', cusd_owner)
    
    if (owner.address !== cusd_owner) {
        console.log('this is not the correct CUSD owner account, exiting')
        return
    }

    let cusd_unlocked = await cusd.methods.isMethodEnabled().call()
    console.log('CUSD locked methods currently enabled? ', cusd_unlocked)
    if (cusd_unlocked) {
        console.log('CUSD locked methods like approve() already unlocked!')
        return;
    }

    console.log('CUSD owner unlocking: ')

    let to = cusd.options.address
    let data = cusd.methods.unlock().encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await cusd.methods.unlock().estimateGas({ from: owner.address }))*1.2)
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

    console.log('\n***** END CUSD::UNLOCK() *****\n')

    return;
}
