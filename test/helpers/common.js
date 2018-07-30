/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./utils/expectRevert');
const expectThrow = require('./utils/expectThrow');
const assertBalance = require('./utils/assertBalance');
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
const RANDOM_ADDRESS = 0x3b5855bAEF50EBFdFC89c5E5463f92BCe194EAc9; 


/** Contract classes **/
// WT0
const WhitelistedToken = artifacts.require("WhitelistedToken");
// Storage classes for CarbonDollar
const FeeSheet = artifacts.require("FeeSheet");
const StablecoinWhitelist = artifacts.require("StablecoinWhitelist");
// CarbonUSD
const CarbonDollar = artifacts.require("CarbonDollar");

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

/* Creating a class with all common Variables */
class CommonVariables {
    constructor(_accounts) {
        this.accounts = _accounts;
        this.owner = _accounts[0];
        this.user = _accounts[1];
        this.attacker = _accounts[2];
        this.user2 = _accounts[3];
        this.user3 = _accounts[4];
        this.validator = _accounts[5];
        this.validator2 = _accounts[6];
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
    RANDOM_ADDRESS,
    WhitelistedToken,
    FeeSheet,
    StablecoinWhitelist,
    CarbonDollar,
}