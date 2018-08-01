const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../../helpers/common')

const { PermissionedTokenProxy, PermissionedToken, BalanceSheet, AllowanceSheet, Regulator } = require('../../helpers/artifacts');

const { PermissionSheetMock, ValidatorSheetMock } = require('../../helpers/mocks');

contract('PermissionedTokenProxy', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner;
    const validator = commonVars.validator;
    const proxyOwner = commonVars.user;
    const user = commonVars.user2;

    beforeEach(async function () {
        // Empty Proxy Data storage + fully loaded regulator
        this.proxyBalancesStorage = (await BalanceSheet.new({ from:owner })).address
        this.proxyAllowancesStorage = (await AllowanceSheet.new({ from:owner })).address
        this.permissionSheet = await PermissionSheetMock.new( {from:owner })
        this.validatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )
        this.proxyRegulator = (await Regulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})).address
        
        // First logic contract
        this.impl_v0 = (await PermissionedToken.new(this.proxyRegulator, this.proxyBalancesStorage, this.proxyAllowancesStorage,{ from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await PermissionedTokenProxy.new(this.impl_v0, this.proxyRegulator, this.proxyBalancesStorage, this.proxyAllowancesStorage, { from:proxyOwner })
        this.proxyAddress = this.proxy.address
    })

    describe('setRegulator, setBalanceStorage and setAllowanceStorage', function () {
        beforeEach(async function () {
            this.newProxyBalanceStorage = (await BalanceSheet.new({ from:owner })).address;
            this.newProxyAllowanceStorage = (await AllowanceSheet.new({ from:owner })).address;
            this.newPermissionSheet = await PermissionSheetMock.new( {from:owner })
            this.newValidatorSheet = await ValidatorSheetMock.new(validator, {from:owner} )
            this.newProxyRegulator = (await Regulator.new(this.newPermissionSheet.address, this.newValidatorSheet.address, { from:owner })).address

            this.logic_v0 = await PermissionedToken.at(this.impl_v0)
        })

        describe('owner calls', function () {
            const from = proxyOwner
            beforeEach(async function () {

                const { logs } = await this.proxy.setBalanceStorage(this.newProxyBalanceStorage, {from})
                this.logs = logs
                this.event = this.logs.find(l => l.event === 'ChangedBalanceStorage').event
                this.oldAddress = this.logs.find(l => l.event === 'ChangedBalanceStorage').args._old
                this.newAddress = this.logs.find(l => l.event === 'ChangedBalanceStorage').args._new

                await this.proxy.setAllowanceStorage(this.newProxyAllowanceStorage, {from})
                await this.proxy.setRegulator(this.newProxyRegulator, { from })

            })
            it('sets token proxy storage and regulator', async function () {
                assert.equal(await this.proxy.balances(), this.newProxyBalanceStorage)
                assert.equal(await this.proxy.allowances(), this.newProxyAllowanceStorage)
                assert.equal(await this.proxy.regulator(), this.newProxyRegulator)

            })
            it('emits a ChangedBalanceStorage event', async function () {
                assert.equal(this.logs.length, 1)
                assert.equal(this.oldAddress, this.proxyBalancesStorage)
                assert.equal(this.newAddress, this.newProxyBalanceStorage)
            })
            it('does not change regulator implementation storages', async function () {
                assert.equal(await this.logic_v0.balances(), this.proxyBalancesStorage)
                assert.equal(await this.logic_v0.allowances(), this.proxyAllowancesStorage)

            })


        })
        describe('non-owner calls', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.setBalanceStorage(this.newProxyBalanceStorage, {from}))
                await expectRevert(this.proxy.setAllowanceStorage(this.newProxyAllowanceStorage, {from}))
                await expectRevert(this.proxy.setRegulator(this.newProxyRegulator, {from}))

            })
        })

    })
    describe('implementation', function () {

        describe('owner calls', function () {
            const from = proxyOwner

            it('returns the Token implementation address', async function () {
                this.implementation = await this.proxy.implementation({from})
                assert.equal(this.implementation, this.impl_v0)
            })
        })
        describe('non-owner calls', function () {
            const from = owner

            it('reverts', async function () {
                await expectRevert(this.proxy.implementation({from}))
            })
        })


    })

    describe('Proxy delegates calls to logic contract', function () {

        beforeEach(async function () {

            this.tokenProxy = PermissionedToken.at(this.proxyAddress)
            this.logic_v0 = PermissionedToken.at(this.impl_v0)
            this.tokenProxyRegulator = Regulator.at(this.proxyRegulator)

            // set user as minter proxy storage and whitelist
            await this.permissionSheet.transferOwnership(this.tokenProxyRegulator.address, {from:owner})
            await this.validatorSheet.transferOwnership(this.tokenProxyRegulator.address, {from:owner})
            await this.tokenProxyRegulator.setMinter(owner, {from:validator})
            await this.tokenProxyRegulator.setWhitelistedUser(user, {from:validator})

            await (await BalanceSheet.at(this.proxyBalancesStorage)).transferOwnership(this.tokenProxy.address, {from:owner})
            await (await AllowanceSheet.at(this.proxyAllowancesStorage)).transferOwnership(this.tokenProxy.address, {from:owner})


        })
        describe('call to proxy to mint', function () {

            it('proxy mints to whitelisted user', async function () {
                await this.tokenProxy.mint(user, 10 * 10 ** 18, {from:owner})
                assert.equal(await this.tokenProxy.balanceOf(user), 10 * 10 ** 18)
            })
        })
    })

    describe('upgradeTo v1', function () {

        beforeEach(async function () {
            // Second logic contract 
            this.permissionSheet_v1 = await PermissionSheetMock.new( {from:owner })
            this.validatorSheet_v1 = await ValidatorSheetMock.new(validator, {from:owner} )
            this.token_logic_v1_regulator = (await Regulator.new(this.permissionSheet_v1.address, this.validatorSheet_v1.address, { from:owner })).address
            this.impl_v1 = (await PermissionedToken.new(this.token_logic_v1_regulator, this.proxyBalancesStorage, this.proxyAllowancesStorage,{ from:owner })).address

        })
        describe('owner calls upgradeTo', function () {
            const from = proxyOwner

            beforeEach(async function () {
                const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
                this.tokenProxy = PermissionedToken.at(this.proxyAddress)

                this.logic_v0 = PermissionedToken.at(this.impl_v0)
                this.logic_v1 = PermissionedToken.at(this.impl_v1)

                this.logs = logs
                this.event = this.logs.find(l => l.event === 'Upgraded').event
                this.newImplementation = this.logs.find(l => l.event === 'Upgraded').args.implementation

            })
            it('upgrades to V1 implementation', async function () {
                this.implementation = await this.proxy.implementation( { from })
                assert.equal(this.implementation, this.impl_v1)
            })
            it('emits an Upgraded event', async function () {
                assert.equal(this.logs.length, 1)
                assert.equal(this.newImplementation, this.impl_v1)
            })
            describe('proxy storages do not change even though logic storages changes', function () {
                it('V0 logic has original balances, allowances, and regulator...', async function () {
                    assert.equal(await this.logic_v0.balances(), this.proxyBalancesStorage)
                    assert.equal(await this.logic_v0.allowances(), this.proxyAllowancesStorage)
                    assert.equal(await this.logic_v0.regulator(), this.proxyRegulator)
                })
                it('V1 logic has a new regulator', async function () {
                    assert.equal(await this.logic_v1.regulator(), this.token_logic_v1_regulator)

                })
                it('proxy storage maintains its original regulator', async function () {
                    assert.equal(await this.proxy.regulator(), this.proxyRegulator)

                })
            })

        })
        describe('Regulator implementation owner calls upgradeTo', function () {
            const from = owner
            it('reverts', async function () {
                await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
            })
        })

    })


})