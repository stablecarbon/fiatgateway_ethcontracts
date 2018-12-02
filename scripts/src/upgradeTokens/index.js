import {
    setRegulatorCusd
} from './upgradeTokens/setRegulatorCusd'
import {
    setRegulatorWt0
} from './upgradeTokens/setRegulatorWt0'
import {
    upgradeCusd
} from './upgradeTokens/upgradeCusd'
import {
    upgradeWt0
} from './upgradeTokens/upgradeWt0'

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
