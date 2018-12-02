import { getWeb3 } from './getWeb3'
import { 
    getCusdFactory,
    getCusdCount,
    getWt0Factory,
    getWt0Count,
    getRegulatorFactory,
    getRegulatorCount,
    getRegulator
} from './getContracts'

let web3 = getWeb3()

export const getFactoryStats = async () => {

    console.log('\n***** FIAT GATEWAY FACTORIES *****\n')

    console.log("Using web3 version: ", web3.version)

    let cusd_factory = getCusdFactory()
    let wt0_factory = getWt0Factory()
    let reg_factory = getRegulatorFactory()
    console.log('CUSD factory: ', cusd_factory.options.address)
    console.log('WT0 factory: ', wt0_factory.options.address)
    console.log('Regulator factory: ', reg_factory.options.address)

    let cusd_count = await getCusdCount()
    let wt0_count = await getWt0Count()
    let reg_count = await getRegulatorCount()
    console.log('CUSD count: ', cusd_count)
    console.log('WT0 count: ', wt0_count)
    console.log('Regulator count: ', reg_count)

    for (var i = 0; i < cusd_count; i++) {
        var instance = await cusd_factory.methods.getToken(i).call()
        console.log('CUSD factory ' + i + 'th token proxy: ' + instance)
    }
    for (var i = 0; i < wt0_count; i++) {
        var instance = await wt0_factory.methods.getToken(i).call()
        console.log('WT0 factory ' + i + 'th token proxy: ' + instance)
    }
    for (var i = 0; i < reg_count; i++) {
        var instance = await reg_factory.methods.getRegulatorProxy(i).call()
        console.log('Regulator factory ' + i + 'th regulator proxy: ' + instance)
        let regulator = getRegulator(instance)
        let owner = await regulator.methods.owner().call()
        console.log(i + 'th regulator proxy owner: ' + owner)
    }

    console.log('\n***** END FIAT GATEWAY FACTORIES *****\n')

    return;
}
