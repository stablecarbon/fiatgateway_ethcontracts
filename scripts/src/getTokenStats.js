import { getWeb3 } from './getWeb3'
import { 
    getCusd,
    getWt0,
    getCusdProxy,
    getWt0Proxy
} from './getContracts'

let web3 = getWeb3()

export const getTokenStats = async () => {

    console.log('\n***** FIAT GATEWAY TOKENS *****\n')

    console.log("Using web3 version: ", web3.version)

    let cusd = getCusd()
    let wt0 = getWt0()
    console.log('CUSD: ', cusd.options.address)
    console.log('WT0: ', wt0.options.address)

    let cusd_supply = await cusd.methods.totalSupply().call()
    let wt0_supply = await wt0.methods.totalSupply().call()
    console.log('CUSD supply: ', cusd_supply)
    console.log('WT0 supply: ', wt0_supply)

    let cusd_owner = await cusd.methods.owner().call()
    let wt0_owner = await wt0.methods.owner().call()
    console.log('CUSD owner: ', cusd_owner)
    console.log('WT0 owner: ', wt0_owner)

    let cusd_proxy = getCusdProxy()
    let wt0_proxy = getWt0Proxy()
    let cusd_impl = await cusd_proxy.methods.implementation().call()
    let wt0_impl = await wt0_proxy.methods.implementation().call()
    console.log('CUSD proxy implementation: ', cusd_impl)
    console.log('WT0 proxy implementation: ', wt0_impl)

    console.log('\n***** END FIAT GATEWAY TOKENS *****\n')

    return;
}
