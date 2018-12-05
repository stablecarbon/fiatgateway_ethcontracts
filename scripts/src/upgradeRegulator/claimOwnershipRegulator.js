import { getWeb3 } from '../getWeb3'
import { 
    getRegulator,
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'
let web3 = getWeb3()

export const claimOwnershipRegulator = async () => {

    console.log('\n***** REGULATOR::CLAIM_OWNERSHIP() *****\n')

    /** CLAIM OWNERSHIP OF NEWLY CREATED REGULATOR PROXY FROM FACTORY **/
    let owner = getOwner()
    console.log("Claiming ownership over a new Regulator proxy from: ", owner.address)
    let regulator_active_address = config.REGULATOR_ACTIVE_ADDRESS
    console.log("Claiming Regulator proxy: ", regulator_active_address)
    let regulator = getRegulator(regulator_active_address)
    let current_owner = await regulator.methods.owner().call()
    let pending_owner = await regulator.methods.pendingOwner().call()
    console.log("Current owner: " + current_owner)
    console.log("Pending owner: " + pending_owner)

    if (owner.address !== pending_owner) {
        console.log('invalid pending owner, exiting')
        return
    }

    /** Constructing and sending transaction **/
    let to = regulator_active_address
    let data = regulator.methods.claimOwnership().encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await regulator.methods.claimOwnership().estimateGas({ from: owner.address }))*1.2)
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
    
    console.log('\n***** END REGULATOR::CLAIM_OWNERSHIP() *****\n')
    return;
}
