import { getWeb3 } from '../getWeb3'
import fs from 'fs'
import config from '../config'

const web3 = getWeb3()

// CUSD Factory
export const getCusdFactory = () => {
    var jsonFile = "./build/contracts/CarbonDollarProxyFactory.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.CUSD_FACTORY_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getCusdCount = async () => {
    let factory = getCusdFactory()
    let count = await factory.methods.getCount().call()
    return count
}

// CUSD
export const getCusd = () => {
    var jsonFile = "./build/contracts/MetaToken.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.CUSD_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getCusdProxy = () => {
    var jsonFile = "./build/contracts/CarbonDollarProxy.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.CUSD_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

// WT0 Factory
export const getWt0Factory = () => {
    var jsonFile = "./build/contracts/WhitelistedTokenProxyFactory.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.WT0_FACTORY_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getWt0Count = async () => {
    let factory = getWt0Factory()
    let count = await factory.methods.getCount().call()
    return count
}

// WT0
export const getWt0 = () => {
    var jsonFile = "./build/contracts/WhitelistedToken.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.WT0_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getWt0Proxy = () => {
    var jsonFile = "./build/contracts/WhitelistedTokenProxy.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.WT0_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

// MetaToken
export const getMetaToken = () => {
    var jsonFile = "./build/contracts/MetaToken.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.CUSD_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

// Regulator
export const getRegulatorFactory = () => {
    var jsonFile = "./build/contracts/RegulatorProxyFactory.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.REGULATOR_FACTORY_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getRegulatorCount = async () => {
    let factory = getRegulatorFactory()
    let count = await factory.methods.getCount().call()
    return count
}

export const getRegulator = (address) => {
    var jsonFile = "./build/contracts/Regulator.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = address ? address : config.REGULATOR_ACTIVE_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

export const getRegulatorProxy = () => {
    var jsonFile = "./build/contracts/RegulatorProxy.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = config.REGULATOR_ACTIVE_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}
