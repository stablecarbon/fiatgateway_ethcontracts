const Web3 = require("web3")

const getWeb3 = () => {
    // FIXME: change this to mainnet infura node for production
    var web3node = 'wss://ropsten.infura.io/ws'
    const myWeb3 = new Web3(new Web3.providers.WebsocketProvider(web3node))
    return myWeb3
}

module.exports = {
    getWeb3,
}