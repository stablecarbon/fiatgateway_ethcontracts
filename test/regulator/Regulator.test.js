const {
    CommonVariables,
    Regulator,
    PermissionsStorage
} = require('../helpers/common');

const {
    regulatorStorageTests
} = require('./RegulatorStorage');

const {
    regulatorPermissionsTests
} = require('./RegulatorPermissions');

const {
    regulatorUserPermissionsTests
} = require('./RegulatorUserPermissions');

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const validator = commonVars.tokenValidator;
    const user = commonVars.userSender;
    const otherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.sheet = await Regulator.new({ from: owner });
        this.pStorage = await PermissionsStorage.new({from: owner});
        this.MINT_SIG = await this.pStorage.MINT_SIG();
        this.MINT_CUSD_SIG = await this.pStorage.MINT_CUSD_SIG();
        this.BURN_SIG = await this.pStorage.BURN_SIG();
        this.TRANSFER_SIG = await this.pStorage.TRANSFER_SIG();
        this.TRANSFER_FROM_SIG = await this.pStorage.TRANSFER_FROM_SIG();
        this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.pStorage.DESTROY_BLACKLISTED_TOKENS_SIG();
        this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.pStorage.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
        this.BLACKLISTED_SIG = await this.pStorage.BLACKLISTED_SIG();
    })

    describe("Regulator tests", function () {
        regulatorStorageTests(owner);
        regulatorPermissionsTests(owner, user, validator);
        regulatorUserPermissionsTests(owner, user, otherAccount, this.MINT_SIG);
    })
})