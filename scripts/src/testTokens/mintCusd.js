import { getWeb3 } from '../getWeb3'
import { 
    getWt0,
    getRegulator
} from '../getContracts'
import {
    getMinter
} from '../getUsers'
import config from '../config'

let web3 = getWeb3()

export const mintCusd = async (amountToMint, receiver) => {

    console.log('\n***** CUSD::MINT() *****\n')

    let wt0 = getWt0()
    console.log('WT0: ', wt0.options.address)

    let minter = getMinter()
    console.log('Minting from account: ', minter.address)
    console.log('Minting to account: ', receiver)
    console.log('Amount to mint: ', amountToMint/10**18)
    let regulator = getRegulator()
    let is_minter = await regulator.methods.isMinter(minter.address)
    if (!is_minter) {
        console.log('Invalid minter account, exiting')
        return
    }

    let to = wt0.options.address
    let data = wt0.methods.mintCUSD(receiver, amountToMint).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await wt0.methods.mintCUSD(receiver, amountToMint).estimateGas({ from: minter.address }))*1.2)
    console.log('Estimated gas cost: ', gas)
    let tx = {
        to,
        data,
        gasPrice,
        gas
    }

    try {
        let sig = await minter.signTransaction(tx)
        let receipt = await web3.eth.sendSignedTransaction(sig.rawTransaction)
        console.log('transaction receipt: ', receipt.transactionHash)
    } catch(err) {
        console.log(err)
    }

    console.log('\n***** END CUSD::MINT() *****\n')

    return;
}
