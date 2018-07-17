const {
    CommonVariables,
    Regulator
} = require('../../helpers/common');

const {
    regulatorStorageTests
} = require('./RegulatorStorage');

const {
    regulatorPermissionsTests
} = require('./RegulatorPermissions');

contract('Regulator', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const validator = commonVars.tokenValidator;
    const user = commonVars.userSender;

    beforeEach(async function () {
        this.sheet = await Regulator.new({ from: owner });
        this.MINT_SIG = await this.sheet.MINT_SIG();
        this.BURN_SIG = await this.sheet.BURN_SIG();
        this.DESTROYSELF_SIG = await this.sheet.DESTROYSELF_SIG();
        this.DESTROYBLACKLIST_SIG = await this.sheet.DESTROYBLACKLIST_SIG();
        this.ADD_BLACKLISTED_SPENDER_SIG = await this.sheet.ADD_BLACKLISTED_SPENDER_SIG();
    })

    describe("Regulator tests", function () {
        regulatorStorageTests(owner);
        regulatorPermissionsTests(owner, user, validator);
    })
})