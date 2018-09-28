var WhitelistedToken = artifacts.require("./WhitelistedToken");
var CarbonDollar = artifacts.require("./CarbonDollar");

module.exports = function (deployer, network, accounts) {
    let wtTokenOwner = accounts[0];
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

    // deployer.deploy(WhitelistedToken, ZERO_ADDRESS, CarbonDollar.address, {from:wtTokenOwner})
    
};