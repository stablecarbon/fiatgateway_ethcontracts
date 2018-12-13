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
import {
    changeCusdFee
} from './changeCusdFee'
import {
    unlock
} from './unlock'

const main = async () => {

    // Change CUSD and WT0 regulator, upgrade the proxy implementation
    // await setRegulatorCusd()
    // await setRegulatorWt0()
    // await upgradeCusd()
    // await upgradeWt0()
    // await changeCusdFee()
    // await unlock()

    return
}

main().then(result => {
    process.exit()
})
