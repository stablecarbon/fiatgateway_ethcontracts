var Migrations = artifacts.require("Migrations");
var PermissionsStorage = artifacts.require("PermissionsStorage");
var ValidatorStorage = artifacts.require("ValidatorStorage");
var WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
var WhitelistedTokenRegulatorProxy = artifacts.require("WhitelistedTokenRegulator");

module.exports = function (deployer, network, accounts) {
    
    if (network == "development") {
        // Setup token regulator
        let tokenRegulator = accounts[0];
        deployer.deploy([
            [PermissionsStorage, { from: tokenRegulator}], 
            [ValidatorStorage, { from: tokenRegulator}],
            [WhitelistedTokenRegulator, { from: tokenRegulator }]
        ]).then(function() {
            ps = PermissionsStorage.deployed();
            vs = ValidatorStorage.deployed();
            r = WhitelistedTokenRegulator.deployed();
            ps.transferOwnership(r.address, { from: tokenRegulator});
            vs.transferOwnership(r.address, { from: tokenRegulator});
            r.setPermissionsStorage(ps, { from: tokenRegulator});
            r.setValidatorStorage(vs, { from: tokenRegulator });
        });

        // Setup CarbonUSD regulator
        let cusdRegulator = accounts[0];
        deployer.deploy([
            [PermissionsStorage, { from: cusdRegulator }],
            [ValidatorStorage, { from: cusdRegulator }],
            [Regulator, { from: cusdRegulator }]
        ]).then(function () {
            ps = PermissionsStorage.deployed();
            vs = ValidatorStorage.deployed();
            r = Regulator.deployed();
            ps.transferOwnership(r.address, { from: cusdRegulator });
            vs.transferOwnership(r.address, { from: cusdRegulator });
            r.setPermissionsStorage(ps, { from: cusdRegulator });
            r.setValidatorStorage(vs, { from: cusdRegulator });
        });
    }
};
