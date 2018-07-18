/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const expectThrow = require('./expectThrow');
const assertBalance = require('./assertBalance');
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/** Contract classes **/
// TrueUSD ERC20 contract tests
const transfersToZeroBecomeBurns = false;

// Regulator and storage classes for regulator
const PermissionsStorage = artifacts.require("PermissionsStorage");
const PermissionsStorageMock = artifacts.require("PermissionsStorageMock");
const ValidatorStorage = artifacts.require("ValidatorStorage");
const ValidatorStorageMock = artifacts.require("ValidatorStorageMock");
const Regulator = artifacts.require("Regulator");
const RegulatorMock = artifacts.require("RegulatorMock");
const RegulatorProxy = artifacts.require("RegulatorProxy");
// PermissionedToken
const BalanceSheet = artifacts.require("BalanceSheet");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const MutablePermissionedToken = artifacts.require("MutablePermissionedToken");
const ImmutablePermissionedToken = artifacts.require("ImmutablePermissionedToken");
const MutablePermissionedTokenProxy = artifacts.require("MutablePermissionedTokenProxy");
// WT0
const WhitelistedToken = artifacts.require("WhitelistedToken");
const WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
const WhitelistedTokenRegulatorMock = artifacts.require("WhitelistedTokenRegulatorMock");
const WhitelistedTokenRegulatorProxy = artifacts.require("WhitelistedTokenRegulatorProxy");
// Storage classes for CarbonDollar
const FeeSheet = artifacts.require("FeeSheet");
const StablecoinWhitelist = artifacts.require("StablecoinWhitelist");
// CarbonUSD
const CarbonDollar = artifacts.require("CarbonDollar");
const CarbonUSD = artifacts.require("CarbonUSD");

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

/* Creating a class with all common Variables */
class CommonVariables {
    constructor(_accounts) {
        this.accounts = _accounts;
        this.tokenOwner = _accounts[0];
        this.tokenRegulatorProxyOwner = _accounts[1];
        this.tokenValidator = _accounts[2];
        this.tokenValidator2 = _accounts[3];
        this.carbonDollarOwner = _accounts[4];
        this.carbonDollarRegulatorProxyOwner = _accounts[5];
        this.carbonDollarValidator = _accounts[6];
        this.attacker = _accounts[7];
        this.userSender = _accounts[8];
        this.userReceiver = _accounts[9];
    }
}

/* Exporting the module */
module.exports = {
    BigNumber,
    expectRevert,
    expectThrow,
    assertBalance,
    CommonVariables,
    ZERO_ADDRESS,
    transfersToZeroBecomeBurns,
    PermissionsStorage,
    PermissionsStorageMock,
    ValidatorStorage,
    ValidatorStorageMock,
    Regulator,
    RegulatorMock,
    RegulatorProxy,
    BalanceSheet,
    AllowanceSheet,
    MutablePermissionedToken,
    ImmutablePermissionedToken,
    MutablePermissionedTokenProxy,
    WhitelistedToken,
    WhitelistedTokenRegulator,
    WhitelistedTokenRegulatorMock,
    WhitelistedTokenRegulatorProxy,
    FeeSheet,
    StablecoinWhitelist,
    CarbonDollar,
    CarbonUSD
}