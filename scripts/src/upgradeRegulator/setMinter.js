import { getWeb3 } from '../getWeb3'
import { 
    getRegulator
} from '../getContracts'
import {
    getOwner,
    getMinter
} from '../getUsers'
import config from '../config'
let web3 = getWeb3()

export const setMinter = async () => {

    console.log('\n***** REGULATOR::SET_MINTER() *****\n')

    /** SET NEW MINTER **/
    let owner = getOwner() // assumption: owner is a validator
    console.log("Setting minter from validator: ", owner.address)
    let regulator_active_address = config.REGULATOR_ACTIVE_ADDRESS
    console.log("Making a call to Regulator proxy: ", regulator_active_address)
    let regulator = getRegulator(regulator_active_address)
    let is_validator = await regulator.methods.isValidator(owner.address).call()
    console.log("Is this caller a validator: " + is_validator)
    let minter = getMinter()
    console.log("New minter: ", minter.address)
    let is_minter = await regulator.methods.isMinter(minter.address).call()
    console.log("Is this user already a minter: " + is_minter)

    if ( !is_minter && is_validator ) {
        let to = regulator_active_address
        let data = regulator.methods.setMinter(minter.address).encodeABI()
        let gasPrice = web3.utils.toWei('25', 'gwei')
        let gas = Math.ceil((await regulator.methods.setMinter(minter.address).estimateGas({ from: owner.address }))*1.2)
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
        console.log('\n***** END REGULATOR::SET_MINTER() *****\n')
        return;
    } else {
        console.log('exiting because either the caller is not a validator or the user is already a minter')
        return
    }
}
