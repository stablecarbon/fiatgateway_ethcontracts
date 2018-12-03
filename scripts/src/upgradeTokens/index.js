import {
    setRegulatorCusd
} from './setRegulatorCusd'
import {
    setRegulatorWt0
} from './setRegulatorWt0'
import {
    upgradeCusd
} from './upgradeCusd'
import {
    upgradeWt0
} from './upgradeWt0'

const main = async () => {

    // Change CUSD and WT0 regulator, upgrade the proxy implementation
    // await setRegulatorCusd()
    // await setRegulatorWt0()
    // await upgradeCusd()
    // await upgradeWt0()

    return
}

main().then(result => {
    process.exit()
})
