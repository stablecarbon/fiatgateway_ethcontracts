/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const expectThrow = require('./expectThrow');
const assertBalance = require('./assertBalance');
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/** Contract classes **/
// TrueUSD ERC20 contracts
const BalanceSheet = artifacts.require("BalanceSheet");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BasicTokenMock = artifacts.require("BasicTokenMock");
const BurnableTokenMock = artifacts.require("BurnableTokenMock");
const PausableTokenMock = artifacts.require("PausableTokenMock");
const StandardTokenMock = artifacts.require("StandardTokenMock");
const ModularMintableToken = artifacts.require("ModularMintableToken");
const transfersToZeroBecomeBurns = false;

// Eternal ERC20 contracts
const EternalMintableToken = artifacts.require("EternalMintableToken");
const EternalBurnableToken = artifacts.require("EternalBurnableToken");
const EternalStandardToken = artifacts.require("EternalStandardToken");
const EternalPausableToken = artifacts.require("EternalPausableToken");
// Eternal storage pattern contracts
const EternalStorage = artifacts.require("EternalStorage");
const EternalStorageProxy = artifacts.require("EternalStorageProxy");
const Proxy = artifacts.require("Proxy");
const UpgradeabilityProxy = artifacts.require("UpgradeabilityProxy");
const UpgradeabilityStorage = artifacts.require("UpgradeabilityStorage");
// Regulator and storage classes for regulator
const PermissionStorage = artifacts.require("PermissionStorage");
const PermissionStorageMock = artifacts.require("PermissionStorageMock");
const UserPermissionsStorage = artifacts.require("UserPermissionsStorage");
const ValidatorStorage = artifacts.require("ValidatorStorage");
const ValidatorStorageMock = artifacts.require("ValidatorStorageMock");
const Regulator = artifacts.require("Regulator");
const RegulatorMock = artifacts.require("RegulatorMock");
const RegulatorProxy = artifacts.require("RegulatorProxy");
// PermissionedToken
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
    BalanceSheet,
    AllowanceSheet,
    BasicTokenMock,
    BurnableTokenMock,
    PausableTokenMock,
    StandardTokenMock,
    ModularMintableToken,
    transfersToZeroBecomeBurns,
    EternalBurnableToken,
    EternalMintableToken,
    EternalPausableToken,
    EternalStandardToken,
    EternalStorage,
    EternalStorageProxy,
    Proxy,
    UpgradeabilityProxy,
    UpgradeabilityStorage,
    PermissionStorage,
    PermissionStorageMock,
    UserPermissionsStorage,
    ValidatorStorage,
    ValidatorStorageMock,
    Regulator,
    RegulatorMock,
    RegulatorProxy,
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