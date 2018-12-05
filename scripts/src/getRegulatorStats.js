import { getWeb3 } from './getWeb3'
import { 
    getRegulator,
    getRegulatorProxy,
} from './getContracts'
import {
    getMinter
} from './getUsers'

let web3 = getWeb3()

export const getRegulatorStats = async () => {

    console.log('\n***** FIAT GATEWAY REGULATOR *****\n')

    console.log("Using web3 version: ", web3.version)

    let regulator = getRegulator()
    console.log('Regulator: ', regulator.options.address)

    let regulator_owner = await regulator.methods.owner().call()
    console.log('Regulator owner: ', regulator_owner)

    let regulator_proxy = getRegulatorProxy()
    let regulator_impl = await regulator_proxy.methods.implementation().call()
    console.log('Regulator proxy implementation: ', regulator_impl)

    let minter = getMinter()
    let is_minter = await regulator.methods.isMinter(minter.address).call()
    console.log(minter.address + ' is minter? ' + is_minter)

    console.log('\n***** END FIAT GATEWAY REGULATOR *****\n')

    return;
}
