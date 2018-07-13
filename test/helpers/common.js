/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const expectThrow = require('./expectThrow');
const assertBalance = require('./assertBalance');
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/** Contract classes **/
// ERC20 contracts
const BalanceSheet = artifacts.require("BalanceSheet");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BasicTokenMock = artifacts.require("BasicTokenMock");
const BurnableTokenMock = artifacts.require("BurnableTokenMock");
const PausableTokenMock = artifacts.require("PausableTokenMock");
const StandardTokenMock = artifacts.require("StandardTokenMock");
const ModularMintableToken = artifacts.require("ModularMintableToken");
const transfersToZeroBecomeBurns = false;

// WT0
const WhitelistedToken = artifacts.require("WhitelistedToken");
const WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
const WhitelistedTokenRegulatorProxy = artifacts.require("WhitelistedTokenRegulatorProxy");
// Storage classes for CarbonDollar
const FeeSheet = artifacts.require("FeeSheet");
const StablecoinWhitelist = artifacts.require("StablecoinWhitelist");
// CarbonUSD
const CarbonDollar = artifacts.require("CarbonDollar");
const Regulator = artifacts.require("Regulator");
const RegulatorProxy = artifacts.require("RegulatorProxy");
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
        this.carbonUSDOwner = _accounts[4];
        this.carbonUSDRegulatorProxyOwner = _accounts[5];
        this.carbonUSDValidator = _accounts[6];
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
    WhitelistedToken,
    WhitelistedTokenRegulator,
    WhitelistedTokenRegulatorProxy,
    FeeSheet,
    StablecoinWhitelist,
    CarbonDollar,
    Regulator,
    RegulatorProxy,
    CarbonUSD
}