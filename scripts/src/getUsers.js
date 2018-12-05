import { getWeb3 } from './getWeb3'
const web3 = getWeb3()
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env
import config from './config'

// Validator is an admin on Regulator contracts
const getValidator = () => {
    var privateKey = process.env.VALIDATOR_KEY;
    var validator = web3.eth.accounts.privateKeyToAccount(privateKey)
    return validator
}

// Minter is capable of minting new CUSD to accounts
const getMinter = () => {
    var privateKey = config.MINTER_KEY;
    var minter = web3.eth.accounts.privateKeyToAccount(privateKey)
    return minter
}

// Owner of token and regulator contracts
const getOwner = (_privateKey) => {
    var privateKey = _privateKey ? _privateKey : process.env.OWNER_KEY;
    var minter = web3.eth.accounts.privateKeyToAccount(privateKey)
    return minter
}
module.exports = {
    getValidator,
    getMinter,
    getOwner
}