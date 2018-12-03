import { getWeb3 } from '../getWeb3'
import { 
    getCusd,
    getWt0,
    getRegulator
} from '../getContracts'
import {
    getMinter
} from '../getUsers'
import config from '../config'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

let web3 = getWeb3()

export const burnCusd = async (amountToBurn, burner) => {

    console.log('\n***** CUSD::BURN() *****\n')

    let cusd = getCusd()
    let wt0 = getWt0()
    console.log('CUSD: ', cusd.options.address)

    console.log('Burning from account: ', burner.address)
    console.log('Stablecoin: ', wt0.options.address)
    console.log('Amount to burn: ', amountToBurn/10**18)

    let current_balance = await cusd.methods.balanceOf(burner.address).call()
    if (current_balance < amountToBurn) {
        console.log('user does not have enough CUSD to burn, exiting')
        return
    }
    console.log('Burner current balance: ', current_balance/10**18)

    let to = cusd.options.address
    let data = cusd.methods.burnCarbonDollar(wt0.options.address, amountToBurn).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await cusd.methods.burnCarbonDollar(wt0.options.address, amountToBurn).estimateGas({ from: burner.address }))*1.2)
    console.log('Estimated gas cost: ', gas)
    let tx = {
        to,
        data,
        gasPrice,
        gas
    }

    try {
        let sig = await burner.signTransaction(tx)
        let receipt = await web3.eth.sendSignedTransaction(sig.rawTransaction)
        console.log('transaction receipt: ', receipt.transactionHash)
    } catch(err) {
        console.log(err)
    }

    console.log('\n***** END CUSD::BURN() *****\n')

    return;
}
