const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert } = require('../../helpers/common')

const { CarbonDollarProxy, CarbonDollar, BalanceSheet, AllowanceSheet, CarbonDollarRegulator, FeeSheet, StablecoinWhitelist } = require('../../helpers/artifacts');

const { PermissionSheetMock, ValidatorSheetMock } = require('../../helpers/mocks');

contract('CarbonDollarProxy', _accounts => {
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
        this.proxyRegulator = (await CarbonDollarRegulator.new(this.permissionSheet.address, this.validatorSheet.address, {from:owner})).address
        
        this.proxyFeeSheet = (await FeeSheet.new({from:owner})).address
        this.proxyWhitelist = (await StablecoinWhitelist.new({from:owner})).address
        // First logic contract
        this.impl_v0 = (await CarbonDollar.new(this.proxyRegulator, this.proxyBalancesStorage, this.proxyAllowancesStorage, this.proxyFeeSheet, this.proxyWhitelist, { from:owner })).address

        // Setting up Proxy initially at version 0 with data storage
        this.proxy = await CarbonDollarProxy.new(this.impl_v0, this.proxyRegulator, this.proxyBalancesStorage, this.proxyAllowancesStorage, this.proxyFeeSheet, this.proxyWhitelist, { from:proxyOwner })
        this.proxyAddress = this.proxy.address

    })

    describe('set fee sheet and stablecoin whitelist', function () {
        beforeEach(async function () {
            this.newProxyFeeSheet = (await FeeSheet.new({from:owner})).address
            this.newProxyWhitelist = (await StablecoinWhitelist.new({from:owner})).address

            this.logic_v0 = await CarbonDollar.at(this.impl_v0)
        })

        describe('owner calls', function () {
            const from = proxyOwner

            it('fee sheet and whitelist are set initially', async function () {
                assert.equal(await this.proxy.stablecoinFees(), this.proxyFeeSheet)
                assert.equal(await this.proxy.stablecoinWhitelist(), this.proxyWhitelist)
            })

            it('sets token proxy fee sheet and whitelist', async function () {
                await this.proxy.setFeeSheet(this.newProxyFeeSheet, {from})
                await this.proxy.setStablecoinWhitelist(this.newProxyWhitelist, {from})
                assert.equal(await this.proxy.stablecoinFees(), this.newProxyFeeSheet)
                assert.equal(await this.proxy.stablecoinWhitelist(), this.newProxyWhitelist)
            })

            it('emits a FeeSheetChanged event', async function () {
                const { logs } = await this.proxy.setFeeSheet(this.newProxyFeeSheet, {from})

                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, 'FeeSheetChanged')
                assert.equal(logs[0].args.oldSheet, this.proxyFeeSheet)
                assert.equal(logs[0].args.newSheet, this.newProxyFeeSheet)
            })
            it('emits a StablecoinWhitelistChanged event', async function () {
                const { logs } = await this.proxy.setStablecoinWhitelist(this.newProxyWhitelist, {from})

                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, 'StablecoinWhitelistChanged')
                assert.equal(logs[0].args.oldWhitelist, this.proxyWhitelist)
                assert.equal(logs[0].args.newWhitelist, this.newProxyWhitelist)
            })
            it('does not change regulator implementation storages', async function () {
                await this.proxy.setFeeSheet(this.newProxyFeeSheet, {from})
                await this.proxy.setStablecoinWhitelist(this.newProxyWhitelist, {from})
                assert.equal(await this.logic_v0.stablecoinFees(), this.proxyFeeSheet)
                assert.equal(await this.logic_v0.stablecoinWhitelist(), this.proxyWhitelist)

            })


        })
        describe('non-owner calls', function () {
            const from = owner
            it('reverts', async function () {

                await expectRevert(this.proxy.setFeeSheet(this.newProxyFeeSheet, {from}))
                await expectRevert(this.proxy.setStablecoinWhitelist(this.newProxyWhitelist, {from}))

            })
        })

    })
    describe('implementation', function () {

        describe('owner calls', function () {
            const from = proxyOwner

            it('returns the implementation address', async function () {
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

            this.tokenProxy = CarbonDollar.at(this.proxyAddress)
            this.logic_v0 = CarbonDollar.at(this.impl_v0)

            await (await FeeSheet.at(this.proxyFeeSheet)).transferOwnership(this.tokenProxy.address, {from:owner})
            await (await StablecoinWhitelist.at(this.proxyWhitelist)).transferOwnership(this.tokenProxy.address, {from:owner})


        })
        // describe('call to proxy to set fee', function () {

        //     it('proxy sets fee on stablecoin', async function () {
        //         // await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
        //         // await this.tokenProxy.setFee(RANDOM_ADDRESS, 100, {from:proxyOwner})
        //         // assert.equal(await this.tokenProxy.getFee(RANDOM_ADDRESS), 100)
        //     })
        // })

        describe('call to proxy to list coin', function () {

            it('proxy sets fee on stablecoin', async function () {
                await this.tokenProxy.listToken(RANDOM_ADDRESS, {from:proxyOwner})
                assert(await this.tokenProxy.isWhitelisted(RANDOM_ADDRESS))
            })
        })
    })

    // describe('upgradeTo v1', function () {

    //     beforeEach(async function () {
    //         // Second logic contract 
    //         this.permissionSheet_v1 = await PermissionSheetMock.new( {from:owner })
    //         this.validatorSheet_v1 = await ValidatorSheetMock.new(validator, {from:owner} )
    //         this.token_logic_v1_regulator = (await Regulator.new(this.permissionSheet_v1.address, this.validatorSheet_v1.address, { from:owner })).address
    //         this.impl_v1 = (await PermissionedToken.new(this.token_logic_v1_regulator, this.proxyBalancesStorage, this.proxyAllowancesStorage,{ from:owner })).address

    //     })
    //     describe('owner calls upgradeTo', function () {
    //         const from = proxyOwner

    //         beforeEach(async function () {
    //             const { logs } = await this.proxy.upgradeTo(this.impl_v1, { from })
    //             this.tokenProxy = PermissionedToken.at(this.proxyAddress)

    //             this.logic_v0 = PermissionedToken.at(this.impl_v0)
    //             this.logic_v1 = PermissionedToken.at(this.impl_v1)

    //             this.logs = logs
    //             this.event = this.logs.find(l => l.event === 'Upgraded').event
    //             this.newImplementation = this.logs.find(l => l.event === 'Upgraded').args.implementation

    //         })
    //         it('upgrades to V1 implementation', async function () {
    //             this.implementation = await this.proxy.implementation( { from })
    //             assert.equal(this.implementation, this.impl_v1)
    //         })
    //         it('emits an Upgraded event', async function () {
    //             assert.equal(this.logs.length, 1)
    //             assert.equal(this.newImplementation, this.impl_v1)
    //         })
    //         describe('proxy storages do not change even though logic storages changes', function () {
    //             it('V0 logic has original balances, allowances, and regulator...', async function () {
    //                 assert.equal(await this.logic_v0.balances(), this.proxyBalancesStorage)
    //                 assert.equal(await this.logic_v0.allowances(), this.proxyAllowancesStorage)
    //                 assert.equal(await this.logic_v0.regulator(), this.proxyRegulator)
    //             })
    //             it('V1 logic has a new regulator', async function () {
    //                 assert.equal(await this.logic_v1.regulator(), this.token_logic_v1_regulator)

    //             })
    //             it('proxy storage maintains its original regulator', async function () {
    //                 assert.equal(await this.proxy.regulator(), this.proxyRegulator)

    //             })
    //         })

    //     })
    //     describe('Regulator implementation owner calls upgradeTo', function () {
    //         const from = owner
    //         it('reverts', async function () {
    //             await expectRevert(this.proxy.upgradeTo(this.impl_v1, {from}))
    //         })
    //     })

    // })


})