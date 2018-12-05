import {
    getTokenStats
} from './getTokenStats'
import {
    getFactoryStats
} from './getFactoryStats'
import {
    getRegulatorStats
} from './getRegulatorStats'

const main = async () => {

    // 1. Get deployed factory facts
    await getFactoryStats()

    // 2. Get deployed token facts
    await getTokenStats()

    // 3. Get deployed regualtor facts
    await getRegulatorStats()

    return
}

main().then(result => {
    process.exit()
})
