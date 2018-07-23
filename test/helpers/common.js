/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const expectThrow = require('./expectThrow');
const assertBalance = require('./assertBalance');
const depositFunds = require('./depositFunds');
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
const RANDOM_ADDRESS = 0x3b5855bAEF50EBFdFC89c5E5463f92BCe194EAc9; // Just a random address

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
const MutablePermissionedTokenMock = artifacts.require("MutablePermissionedTokenMock");
const ImmutablePermissionedToken = artifacts.require("ImmutablePermissionedToken");
const ImmutablePermissionedTokenMock = artifacts.require("ImmutablePermissionedTokenMock");
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
    }
}

/* Exporting the module */
module.exports = {
    BigNumber,
    expectRevert,
    expectThrow,
    depositFunds,
    assertBalance,
    CommonVariables,
    ZERO_ADDRESS,
    RANDOM_ADDRESS,
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
    MutablePermissionedTokenMock,
    ImmutablePermissionedToken,
    ImmutablePermissionedTokenMock,
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