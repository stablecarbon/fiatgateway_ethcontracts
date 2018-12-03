var MetaToken = artifacts.require("./MetaToken");

module.exports = function (deployer, network, accounts) {
    let metaTokenOwner = accounts[0];
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

    deployer.deploy(MetaToken, ZERO_ADDRESS, {from:metaTokenOwner})
    
};