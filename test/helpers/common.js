/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const CreateRedeemToken = artifacts.require("./CreateRedeemTokenMock.sol");
const RegulatorService = artifacts.require("./RegulatorService.sol");
const ServiceRegistry = artifacts.require("./ServiceRegistry.sol");
const BigNumber = web3.BigNumber;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .use(require('chai-as-promised'))
    .should();//To enable should chai style

/* Creating a class with all common Variables */
class CommonVariables {
    constructor(_accounts) {
        this.accounts = _accounts;

        this.appOwner = _accounts[0]
        this.tokenOwner = _accounts[1]
        this.participants = _.difference(_accounts, [_accounts[0], _accounts[1]]);
    }
}

/* Exporting the module */
module.exports = {
    BigNumber,
    CreateRedeemToken,
    expectRevert,
    CommonVariables,
    ZERO_ADDRESS,
    RegulatorService,
    ServiceRegistry
}