import { getWeb3 } from '../getWeb3'
import { 
    getCusd,
    getWt0,
    getRegulator
} from '../getContracts'
import config from '../config'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

let web3 = getWeb3()

export const balanceOf = async (user) => {

    console.log('\n***** TOKEN::BALANCE_OF() *****\n')

    let cusd = getCusd()
    let wt0 = getWt0()
    console.log('CUSD: ', cusd.options.address)
    console.log('WT0: ', wt0.options.address)

    let balance_cusd = await cusd.methods.balanceOf(user).call()
    let balance_wt0 = await wt0.methods.balanceOf(user).call()
    console.log('USER: ', user)
    console.log('current balance CUSD: ', balance_cusd/10**18)
    console.log('current balance WT0: ', balance_wt0/10**18)

    console.log('\n***** END TOKEN::BALANCE_OF() *****\n')

    return;
}
