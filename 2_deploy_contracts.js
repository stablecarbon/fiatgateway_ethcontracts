var Migrations = artifacts.require("Migrations");
var PermissionsStorage = artifacts.require("PermissionsStorage");
var ValidatorStorage = artifacts.require("ValidatorStorage");
var WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
var AllowanceSheet = artifacts.require("AllowanceSheet");
var BalanceSheet = artifacts.require("BalanceSheet");
var WhitelistedToken = artifacts.require("WhitelistedToken");

var StablecoinWhitelist = artifacts.require("StablecoinWhitelist");
var FeeSheet = artifacts.require("FeeSheet");
var CarbonDollar = artifacts.require("CarbonDollar");
var CarbonUSD = artifacts.require("CarbonUSD");

function deployLiveContracts(deployer, accounts) {
    // Setup CarbonUSD regulator
    let cusdRegulator = accounts[1];
    deployer.deploy([
        [PermissionsStorage, { from: cusdRegulator }],
        [ValidatorStorage, { from: cusdRegulator }],
        [Regulator, { from: cusdRegulator }]
    ]).then(function () {
        ps = PermissionsStorage.deployed();
        vs = ValidatorStorage.deployed();
        cr = Regulator.deployed();
        ps.transferOwnership(cr.address, { from: cusdRegulator });
        vs.transferOwnership(cr.address, { from: cusdRegulator });
        cr.setPermissionsStorage(ps, { from: cusdRegulator });
        cr.setValidatorStorage(vs, { from: cusdRegulator });
    }).then(function () {
        // Setup CarbonUSD token
        let cusdOwner = accounts[2];
        deployer.deploy(BalanceSheet, { from: wtOwner }).then(function () {
            bsheet = BalanceSheet.deployed();
        deployer.deploy(AllowanceSheet, { from: wtOwner }).then(function () {
            asheet = AllowanceSheet.deployed();
        deployer.deploy([
            [CarbonDollar, asheet.address, bsheet.address, { from: cusdOwner }],
            [StablecoinWhitelist, { from: cusdOwner }],
            [FeeSheet, { from: cusdOwner }],
        ]).then(function () {
            cd = CarbonDollar.deployed();
            asheet = AllowanceSheet.deployed();
            bsheet = BalanceSheet.deployed();
            sw = StablecoinWhitelist.deployed();
            fs = FeeSheet.deployed();
            cusd = CarbonUSD.deployed();
            asheet.transferOwnership(cd.address, { from: cusdOwner });
            bsheet.transferOwnership(cd.address, { from: cusdOwner });
            sw.transferOwnership(cd.address, { from: cusdOwner });
            fs.transferOwnership(cd.address, { from: cusdOwner });
            cd.setAllowanceSheet(asheet.address, { from: cusdOwner });
            cd.setBalanceSheet(bsheet.address, { from: cusdOwner });
            cd.setStablecoinWhitelist(sw.address, { from: cusdOwner });
            cd.setFeeSheet(fs.address, { from: cusdOwner });
            cd.setRegulator(cr.address, { from: cusdOwner });

            cusd.upgradeTo(cd.address, { from: cusdOwner });
        })
        })
        })
    })

    // Setup WT0 regulator
    let tokenRegulator = accounts[0];
    deployer.deploy([
        [PermissionsStorage, { from: tokenRegulator }],
        [ValidatorStorage, { from: tokenRegulator }],
        [WhitelistedTokenRegulator, { from: tokenRegulator }]
    ]).then(function () {
        ps = PermissionsStorage.deployed();
        vs = ValidatorStorage.deployed();
        wtr = WhitelistedTokenRegulator.deployed();
        ps.transferOwnership(wtr.address, { from: tokenRegulator });
        vs.transferOwnership(wtr.address, { from: tokenRegulator });
        wr.setPermissionsStorage(ps, { from: tokenRegulator });
        wtr.setValidatorStorage(vs, { from: tokenRegulator });
    }).then(function () {
        // Setup WT0 token
        let wtOwner = accounts[3];
        deployer.deploy(BalanceSheet, { from: wtOwner }).then(function () {
            bsheet = BalanceSheet.deployed();
        deployer.deploy(AllowanceSheet, { from: wtOwner }).then(function () {
            asheet = AllowanceSheet.deployed();
        deployer.deploy(WhitelistedToken, asheet.address, bsheet.address, { from: wtOwner }).then(function () {
            wt = WhitelistedToken.deployed();
            asheet.transferOwnership(wt.address, { from: wtOwner });
            bsheet.transferOwnership(wt.address, { from: wtOwner });
            wt.setAllowanceSheet(asheet.address, { from: wtOwner });
            wt.setBalanceSheet(bsheet.address, { from: wtOwner });
            wt.setRegulator(wtr.address, { from: wtOwner });
        })
        })
        })
    })
}

module.exports = function (deployer, network, accounts) {
    if (network == "live") {
        deployDevelopmentContracts(deployer, accounts);
    }
};
