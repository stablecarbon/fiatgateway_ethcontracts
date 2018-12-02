import {
    getTokenStats
} from './getTokenStats'
import {
    getFactoryStats
} from './getFactoryStats'

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
