import { getWeb3 } from '../getWeb3'
import { 
    getCusd,
    getRegulator
} from '../getContracts'
import {
    getMinter
} from '../getUsers'
import config from '../config'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

let web3 = getWeb3()

export const transferCusd = async (amountToSend, sender, recipient) => {

    console.log('\n***** CUSD::TRANSFER() *****\n')

    let cusd = getCusd()
    console.log('CUSD: ', cusd.options.address)

    console.log('Transferring from account: ', sender.address)
    console.log('Transferring to account: ', recipient)
    console.log('Amount to send: ', amountToSend/10**18)

    let current_balance = await cusd.methods.balanceOf(sender.address).call()
    if (current_balance < amountToSend) {
        console.log('user does not have enough CUSD to send, exiting')
        return
    }
    console.log('Sender current balance: ', current_balance/10**18)

    let to = cusd.options.address
    let data = cusd.methods.transfer(recipient, amountToSend).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await cusd.methods.transfer(recipient, amountToSend).estimateGas({ from: sender.address }))*1.2)
    console.log('Estimated gas cost: ', gas)
    let tx = {
        to,
        data,
        gasPrice,
        gas
    }

    try {
        let sig = await sender.signTransaction(tx)
        let receipt = await web3.eth.sendSignedTransaction(sig.rawTransaction)
        console.log('transaction receipt: ', receipt.transactionHash)
    } catch(err) {
        console.log(err)
    }

    console.log('\n***** END CUSD::TRANSFER() *****\n')

    return;
}
