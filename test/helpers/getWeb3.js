const Web3 = require("web3")

// Convert truffle-injected web3 to web3@1.X
const getWeb3 = () => {
    const myWeb3 = new Web3(web3.currentProvider)
    return myWeb3
}

// assumes passed-in web3 is v1.0 and creates a function to receive contract name
const getContractInstance = (contractName, contractAddress) => {
    let _web3 = getWeb3()
    const artifact = artifacts.require(contractName) // globally injected artifacts helper
    const deployedAddress = contractAddress ? contractAddress : artifact.networks[artifact.network_id].address
    const instance = new _web3.eth.Contract(artifact.abi, deployedAddress)
    return instance
}

module.exports = {
    getWeb3,
    getContractInstance
}