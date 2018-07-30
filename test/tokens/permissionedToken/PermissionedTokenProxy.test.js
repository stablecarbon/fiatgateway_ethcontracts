const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../../helpers/common')

const { PermissionedTokenProxy, PermissionedToken, BalanceSheet, AllowanceSheet, Regulator } = require('../../helpers/artifacts');

const { PermissionedTokenMock, RegulatorFullyLoadedMock } = require('../../helpers/mocks');

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
        this.newRegulator = (await RegulatorFullyLoadedMock.new(owner, { from:owner })).address

        // Logic contract storage
        this.token_logic_v1_regulator = (await RegulatorFullyLoadedMock.new(owner, { from:owner })).address
        
        // Upgradeable logic contracts
        this.impl_v0 = (await PermissionedToken.new({ from:owner })).address
        this.impl_v1 = (await PermissionedTokenMock.new(this.token_logic_v1_regulator)).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await PermissionedTokenProxy.new(this.impl_v0, this.newRegulator, this.proxyBalancesStorage, this.proxyAllowancesStorage, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

    })

    // describe('setRegulator, setBalanceStorage and setAllowanceStorage', function () {
    //     beforeEach(async function () {
    //         this.newProxyBalanceStorage = (await BalanceSheet.new({ from:owner })).address;
    //         this.newProxyAllowanceStorage = (await AllowanceSheet.new({ from:owner })).address;
    //         this.newProxyRegulator = (await RegulatorFullyLoadedMock.new(owner, { from:owner })).address

    //         this.logic_v0 = await PermissionedToken.at(this.impl_v0)
    //     })

    //     describe('owner calls', function () {
    //         const from = proxyOwner
    //         beforeEach(async function () {

    //             const { logs } = await this.proxy.setBalanceStorage(this.newProxyBalanceStorage, {from})
    //             this.logs = logs
    //             this.event = this.logs.find(l => l.event === 'ChangedBalanceStorage').event
    //             this.oldAddress = this.logs.find(l => l.event === 'ChangedBalanceStorage').args._old
    //             this.newAddress = this.logs.find(l => l.event === 'ChangedBalanceStorage').args._new

    //             await this.proxy.setAllowanceStorage(this.newProxyAllowanceStorage, {from})
    //             await this.proxy.setRegulator(this.newProxyRegulator, { from })

    //         })
    //         it('sets token proxy storage and regulator', async function () {
    //             assert.equal(await this.proxy._balances(), this.newProxyBalanceStorage)
    //             assert.equal(await this.proxy._allowances(), this.newProxyAllowanceStorage)
    //             assert.equal(await this.proxy._regulator(), this.newProxyRegulator)

    //         })
    //         it('emits a ChangedBalanceStorage event', async function () {
    //             assert.equal(this.logs.length, 1)
    //             assert.equal(this.oldAddress, this.proxyBalancesStorage)
    //             assert.equal(this.newAddress, this.newProxyBalanceStorage)
    //         })
    //         it('does not change regulator implementation storages', async function () {
    //             assert.equal(await this.logic_v0._balances(), ZERO_ADDRESS)
    //             assert.equal(await this.logic_v0._allowances(), ZERO_ADDRESS)

    //         })


    //     })
    //     // describe('non-owner calls', function () {
    //     //     const from = owner
    //     //     it('reverts', async function () {
    //     //         await expectRevert(this.proxy.setBalanceStorage(this.newProxyBalanceStorage, {from}))
    //     //         await expectRevert(this.proxy.setAllowanceStorage(this.newProxyAllowanceStorage, {from}))
    //     //         await expectRevert(this.proxy.setRegulator(this.newProxyRegulator, {from}))

    //     //     })
    //     // })

    // })
    describe('implementation', function () {

        describe('owner calls', function () {
            const from = proxyOwner

            it('returns the Regulator implementation address', async function () {
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
            this.tokenProxyRegulator = Regulator.at(this.newRegulator)

            // set user as minter proxy storage and whitelist
            await this.tokenProxyRegulator.setMinter(owner, {from:owner})
            await this.tokenProxyRegulator.setWhitelistedUser(user, {from:owner})

        })
        describe('call to proxy to mint', function () {

            it('proxy mints to whitelisted user', async function () {
                await this.tokenProxy.mint(user, 10 * 10 ** 18, {from:owner})
                assert.equal(await this.tokenProxy.balanceOf(user), 10 * 10 ** 18)
            })
        })
    })

    describe('upgradeTo v1', function () {

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
                it('V0 logic has storage set to 0x0000...', async function () {
                    assert.equal(await this.logic_v0._balances(), ZERO_ADDRESS)
                    assert.equal(await this.logic_v0._allowances(), ZERO_ADDRESS)
                    assert.equal(await this.logic_v0._regulator(), ZERO_ADDRESS)
                })
                it('V1 logic has its own storages', async function () {
                    assert.equal(await this.logic_v1._regulator(), this.token_logic_v1_regulator)

                })
                it('proxy storage remains the same', async function () {
                    assert.equal(await this.proxy._regulator(), this.newRegulator)

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