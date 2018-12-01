import { getWeb3 } from './getWeb3'
import { 
    getCusd,
    getWt0
} from './getContracts'

import {
    getFactoryStats
} from './getFactoryStats'

// 1. Get deployed factory and implementation contracts
// 2. Create new proxies via factory with implementation
// 3. Transfer and claim ownership as neccessary

let web3 = getWeb3()

const main = async () => {

    await getFactoryStats()

    return
}

main().then(result => {
    process.exit()
})
