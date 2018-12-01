import { getWeb3 } from './getWeb3'
import fs from 'fs'
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

const web3 = getWeb3()

// CUSD Factory
export const getCusdFactory = () => {
    var jsonFile = "./build/contracts/CarbonDollarProxyFactory.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = process.env.CUSD_FACTORY_ADDRESS;
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
    var jsonFile = "./build/contracts/CarbonDollar.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = process.env.CUSD_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}

// WT0 Factory
export const getWt0Factory = () => {
    var jsonFile = "./build/contracts/WhitelistedTokenProxyFactory.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var deployedAddress = process.env.WT0_FACTORY_ADDRESS;
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
    var deployedAddress = process.env.WT0_ADDRESS;
    const instance = new web3.eth.Contract(abi, deployedAddress)
    return instance
}
