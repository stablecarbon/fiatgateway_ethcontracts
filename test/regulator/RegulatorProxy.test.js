const {
    CommonVariables,
        Regulator,
        RegulatorProxy,
        PermissionsStorage
} = require('../helpers/common');

const {
    regulatorStorageTests
} = require('./RegulatorStorage');

const {
    regulatorStorageInteractionsTests
} = require('./RegulatorStorageInteractions');

const {
    regulatorPermissionsTests
} = require('./RegulatorPermissions');

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const validator = commonVars.tokenValidator;
    const user = commonVars.userSender;
    const otherAccount = commonVars.userReceiver;

    beforeEach(async function () {
        this.regulator = await Regulator.new({ from: owner });
        this.sheet = await RegulatorProxy.new(this.regulator.address, { from: owner });
        this.pStorage = await PermissionsStorage.new({ from: owner });
        this.MINT_SIG = await this.pStorage.MINT_SIG();
        this.MINT_CUSD_SIG = await this.pStorage.MINT_CUSD_SIG();
        this.BURN_SIG = await this.pStorage.BURN_SIG();
        this.TRANSFER_SIG = await this.pStorage.TRANSFER_SIG();
        this.TRANSFER_FROM_SIG = await this.pStorage.TRANSFER_FROM_SIG();
        this.DESTROY_BLACKLISTED_TOKENS_SIG = await this.pStorage.DESTROY_BLACKLISTED_TOKENS_SIG();
        this.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG = await this.pStorage.ADD_BLACKLISTED_ADDRESS_SPENDER_SIG();
        this.BLACKLISTED_SIG = await this.pStorage.BLACKLISTED_SIG();
    })

    describe("RegulatorProxy performs the same as regulator", function () {
        regulatorStorageTests(owner);
        regulatorStorageInteractionsTests(owner, user, validator, otherAccount);
        regulatorPermissionsTests(owner, user, otherAccount);
    })
})