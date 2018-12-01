import { getWeb3 } from './getWeb3'
import { 
    getCusdFactory,
    getCusdCount,
    getWt0Factory,
    getWt0Count,
} from './getContracts'

let web3 = getWeb3()

export const getFactoryStats = async () => {

    console.log('\n***** FIAT GATEWAY FACTORIES *****\n')

    console.log("Using web3 version: ", web3.version)

    let cusd_factory = getCusdFactory()
    let wt0_factory = getWt0Factory()
    console.log('CUSD factory: ', cusd_factory.options.address)
    console.log('WT0 factory: ', wt0_factory.options.address)

    let cusd_count = await getCusdCount()
    let wt0_count = await getWt0Count()
    console.log('CUSD count: ', cusd_count)
    console.log('WT0 count: ', wt0_count)

    let i = 0
    let cusd = await cusd_factory.methods.getToken(i).call()
    let wt0 = await wt0_factory.methods.getToken(i).call()

    console.log('CUSD factory 0th token: ', cusd)
    console.log('WT0 factory 0th token: ', wt0)

    console.log('\n***** END FIAT GATEWAY FACTORIES *****\n')

    return;
}
