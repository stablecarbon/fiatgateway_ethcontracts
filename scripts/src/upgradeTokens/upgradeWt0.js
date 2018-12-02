import { getWeb3 } from '../getWeb3'
import { 
    getWt0Proxy,
} from '../getContracts'
import {
    getOwner
} from '../getUsers'
import config from '../config'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

let web3 = getWeb3()

export const upgradeWt0 = async () => {

    console.log('\n***** WT0_PROXY::UPGRADE() *****\n')

    let proxy = getWt0Proxy()
    console.log('WT0 Proxy: ', proxy.options.address)

    // Ropsten token owner is 0xf886...
    let owner = getOwner(process.env.MINTER_KEY)
    console.log('Upgrading implementation from account: ', owner.address)

    let proxy_owner = await proxy.methods.owner().call()
    console.log('Proxy owner: ', proxy_owner)
    
    if (owner.address !== proxy_owner) {
        console.log('this is not the correct proxy owner account, exiting')
        return
    }

    let current_implementation = await proxy.methods.implementation().call()
    console.log('Proxy current implementation: ', current_implementation)

    let new_implementation = config.WT0_MODEL_ADDRESS
    console.log('WT0 owner changing regulator to: ', new_implementation)

    if (new_implementation === current_implementation) {
        console.log('this token model is already the current model, exiting')
        return
    }

    let to = proxy.options.address
    let data = proxy.methods.upgradeTo(new_implementation).encodeABI()
    let gasPrice = web3.utils.toWei('25', 'gwei')
    let gas = Math.ceil((await proxy.methods.upgradeTo(new_implementation).estimateGas({ from: owner.address }))*1.2)
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

    console.log('\n***** END WT0_PROXY::UPGRADE() *****\n')

    return;
}
