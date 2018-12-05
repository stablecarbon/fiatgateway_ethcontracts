const Web3 = require("web3")
import config from './config'

const getWeb3 = () => {
    // @dev change this to mainnet infura node for production
    var web3node = config.web3node
    const myWeb3 = new Web3(new Web3.providers.WebsocketProvider(web3node))
    return myWeb3
}

module.exports = {
    getWeb3,
}