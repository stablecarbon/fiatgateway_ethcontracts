/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const PermissionedToken = artifacts.require("./PermissionedToken.sol");
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
        this.appOwner = _accounts[0];
        this.tokenOwner = _accounts[1];
        this.regulatorService1 = _accounts[2];
        this.regulatorService2 = _accounts[3];
        this.attacker = _accounts[4];
    }
}

/* Exporting the module */
module.exports = {
    BigNumber,
    PermissionedToken,
    expectRevert,
    CommonVariables,
    ZERO_ADDRESS,
    RegulatorService,
    ServiceRegistry
}