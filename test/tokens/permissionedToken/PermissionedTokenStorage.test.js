const { CommonVariables, ZERO_ADDRESS } = require('../../helpers/common');

const { PermissionedTokenStorage,
        RegulatorProxyFactory,
        Regulator } = require('../../helpers/artifacts');

const { permissionedTokenStorageTests } = require('./permissionedTokenStorageBehavior/PermissionedTokenStorage.js');


contract('PermissionedTokenStorage', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const user = commonVars.user;
    const attacker = commonVars.attacker;
    const tokenHolder = commonVars.user2;
    const spender = commonVars.user3;

    beforeEach(async function () {
        this.regulatorFactory = await RegulatorProxyFactory.new({ from:owner })
        this.regulator_impl_0 = await Regulator.new({ from:owner })
        await this.regulatorFactory.createRegulatorProxy(this.regulator_impl_0.address, {from: owner })
        this.regulator = Regulator.at(await this.regulatorFactory.getRegulatorProxy((await this.regulatorFactory.getCount())-1))
        
        // Claim ownership of newly created proxy   
        await this.regulator.claimOwnership({ from:owner})

        this.storage = await PermissionedTokenStorage.new(this.regulator.address, { from:owner })
    })

    describe("PermissionedTokenStorage tests", function () {
        permissionedTokenStorageTests(owner, tokenHolder, spender, user);
    })
})
