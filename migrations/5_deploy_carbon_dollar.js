var CarbonDollar = artifacts.require("./CarbonDollar");

module.exports = function (deployer, network, accounts) {
    let cdTokenOwner = accounts[0];
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    
    deployer.deploy(CarbonDollar, ZERO_ADDRESS, {from:cdTokenOwner})
};