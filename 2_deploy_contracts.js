var Migrations = artifacts.require("Migrations");
var PermissionsStorage = artifacts.require("PermissionsStorage");
var ValidatorStorage = artifacts.require("ValidatorStorage");
var WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
var WhitelistedTokenRegulatorProxy = artifacts.require("WhitelistedTokenRegulator");

module.exports = function (deployer, network, accounts) {
    
    if (network == "development") {
        // Setup token regulator
        let regulator = accounts[0];
        deployer.deploy(
            [PermissionsStorage, {from: regulator}], 
            [ValidatorStorage, {from: regulator}],
            [WhitelistedTokenRegulator, { from: regulator }],
            [WhitelistedTokenRegulatorProxy, { from: regulator }]);
    }
    
};
