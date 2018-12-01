import { getWeb3 } from './getWeb3'
import {
    getTokenStats
} from './getTokenStats'
import {
    getFactoryStats
} from './getFactoryStats'

// 2. Create new proxies via factory with implementation
// 3. Transfer and claim ownership as neccessary

let web3 = getWeb3()

const main = async () => {

    // 1. Get deployed factory facts
    await getFactoryStats()

    // 2. Get deployed token facts
    await getTokenStats()
    
    return
}

main().then(result => {
    process.exit()
})
