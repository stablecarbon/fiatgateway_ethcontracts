const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../helpers/common');

const { AdminUpgradeabilityProxy, Regulator } = require('../helpers/artifacts');

const { PermissionsStorageMock, ValidatorStorageMock } = require('../helpers/mocks');

contract('RegulatorProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const minter = commonVars.user;
    const whitelisted = commonVars.user2;
    const blacklisted = commonVars.attacker;
    const nonlisted = commonVars.user3;
    const validator = commonVars.validator;
    const validator2 = commonVars.validator2;

    before(async function () {
    	const from = owner

        this.reg_v0 = (await Regulator.new({ from }));
        // this.testPermissionsStorage = await PermissionsStorageMock.new({ from });
        // this.testValidatorStorage = await ValidatorStorageMock.new(validator, { from });
        // await this.testValidatorStorage.transferOwnership(this.reg_v0.address, { from });
        // await this.testPermissionsStorage.transferOwnership(this.reg_v0.address, { from });
        // await this.reg_v0.setPermissionsStorage(this.testPermissionsStorage.address, { from });
        // await this.reg_v0.setValidatorStorage(this.testValidatorStorage.address, { from });

        this.impl_v0 = this.reg_v0.address;
    	// this.impl_v1 = (await RegulatorMock.new(validator2, minter, whitelisted, blacklisted, nonlisted, { from })).address
    })

    beforeEach(async function () {
    	const from = owner

    	this.proxy = await AdminUpgradeabilityProxy.new(this.impl_v0, { from })
    	this.proxyAddress = this.proxy.address
    })

    describe('implementation', function () {

    	const from = owner

    	it('returns the current implementation address', async function () {
    		const implementation = await this.proxy.implementation({ from })
    		assert.equal(implementation, this.impl_v0)
    	})


    	it('delegates to the implementation', async function () {
    		this.sheet = await Regulator.at(this.proxyAddress)

            this.testPermissionsStorage = await PermissionsStorageMock.new({ from });
            await this.testPermissionsStorage.transferOwnership(this.sheet.address, { from });
            await this.sheet.setPermissionsStorage(this.testPermissionsStorage.address, { from });
            // assert.equal(this.sheet.permissions(), this.testPermissionsStorage.address);
            // console.log(this.sheet.permissions())

    	})

    })

})