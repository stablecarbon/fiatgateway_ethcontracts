/* Loading all imports */
const _ = require('lodash');
const expectRevert = require('./expectRevert');
const PermissionedToken = artifacts.require("./PermissionedToken.sol");
const Regulator = artifacts.require("./Regulator.sol");
const RegulatorProxy = artifacts.require("./RegulatorProxy.sol");
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
        this.tokenOwner = _accounts[0];
        this.regulatorOwner = _accounts[1];
        this.regulatorProxyOwner = _accounts[2];
        this.regulatorOwner2 = _accounts[3];
        this.attacker = _accounts[4];
        this.userSender = _accounts[5];
        this.userReceiver = _accounts[6];
    }
}

/* Exporting the module */
module.exports = {
    BigNumber,
    PermissionedToken,
    expectRevert,
    CommonVariables,
    ZERO_ADDRESS,
    Regulator,
    RegulatorProxy
}