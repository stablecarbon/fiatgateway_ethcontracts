const { expectRevert, ZERO_ADDRESS } = require("../../../helpers/common");

const { BalanceSheet, AllowanceSheet } = require("../../../helpers/artifacts");

const { MutableStoragePermissionedTokenMock, RegulatorFullyLoadedMock } = require('../../../helpers/mocks');


function permissionedTokenMutableStorageTests(owner, nonOwner) {
    describe("Permissioned Token Storage setting/getting tests", function () {

    	describe('setRegulator', function () {

    		const from = owner
    		beforeEach(async function () {

                // Initial Token storages
                this.balances = (await BalanceSheet.new({ from })).address
                this.allowances = (await AllowanceSheet.new({ from })).address
                this.oldRegulator = await this.token._regulator()

                // make token reference a new, mutable token
                this.mutableStorageToken = await MutableStoragePermissionedTokenMock.new(this.oldRegulator, this.balances, this.allowances, {from})
    		
                 // create a new regulator loaded with all permissions
                this.newRegulator = (await RegulatorFullyLoadedMock.new(owner, { from })).address
            })

    		describe('owner calls', function () {
    			it('changes regulator', async function () {
    				await this.mutableStorageToken.setRegulator(this.newRegulator, { from });
    				assert.equal(await this.mutableStorageToken._regulator(), this.newRegulator)
    			})
    			it('emits a ChangedRegulator event', async function () {
    				const { logs } = await this.mutableStorageToken.setRegulator(this.newRegulator, { from })
    				assert.equal(logs.length, 1)
    				assert.equal(logs[0].event, "ChangedRegulator")
    				assert.equal(logs[0].args._old, this.oldRegulator)
    				assert.equal(logs[0].args._new, this.newRegulator)
    			})

   				describe('new regulator is a non-contract address', function () {
   					it('reverts', async function() {
   						
                        await expectRevert(this.mutableStorageToken.setRegulator(owner, { from }));
                        await expectRevert(this.mutableStorageToken.setRegulator(ZERO_ADDRESS, { from }));

   					})
   				}) 
                describe('new regulator is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.mutableStorageToken.setRegulator(this.oldRegulator, { from }));

                    })
                }) 
    		})

    		describe('non-owner calls', function () {

    			const from = nonOwner
    			it('reverts', async function () {
    				await expectRevert(this.mutableStorageToken.setRegulator(this.newRegulator, { from }))
    			})
    		})
    	})

        describe('setBalanceStorage', function () {

            const from = owner
            beforeEach(async function () {

                // Create Token storage contracts
                this.balances = (await BalanceSheet.new({ from })).address
                this.allowances = (await AllowanceSheet.new({ from })).address
                this.oldRegulator = await this.token._regulator()

                // make token reference a new, mutable token
                this.mutableStorageToken = await MutableStoragePermissionedTokenMock.new(this.oldRegulator, this.balances, this.allowances, {from})
            
                // new balance sheet
                this.newBalances = (await BalanceSheet.new({from})).address
            })

            describe('owner calls', function () {
                it('changes balance sheet', async function () {
                    await this.mutableStorageToken.setBalanceStorage(this.newBalances, { from });
                    assert.equal(await this.mutableStorageToken._balances(), this.newBalances)
                })
                it('emits a ChangedBalanceStorage event', async function () {
                    const { logs } = await this.mutableStorageToken.setBalanceStorage(this.newBalances, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "ChangedBalanceStorage")
                    assert.equal(logs[0].args._old, this.balances)
                    assert.equal(logs[0].args._new, this.newBalances)
                })

                describe('new balances is a non-contract address', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.mutableStorageToken.setBalanceStorage(owner, { from }));
                        await expectRevert(this.mutableStorageToken.setBalanceStorage(ZERO_ADDRESS, { from }));

                    })
                }) 
                describe('new balances is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.mutableStorageToken.setBalanceStorage(this.balances, { from }));

                    })
                }) 
            })

            describe('non-owner calls', function () {

                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.mutableStorageToken.setBalanceStorage(this.newBalances, { from }))
                })
            })
        })

        describe('setAllowanceStorage', function () {

            const from = owner
            beforeEach(async function () {

                // Create Token storage contracts
                this.balances = (await BalanceSheet.new({ from })).address
                this.allowances = (await AllowanceSheet.new({ from })).address
                this.oldRegulator = await this.token._regulator()

                // make token reference a new, mutable token
                this.mutableStorageToken = await MutableStoragePermissionedTokenMock.new(this.oldRegulator, this.balances, this.allowances, {from})
            
                // new allowances sheet
                this.newAllowances = (await AllowanceSheet.new({from})).address
            })

            describe('owner calls', function () {
                it('changes allowance sheet', async function () {
                    await this.mutableStorageToken.setAllowanceStorage(this.newAllowances, { from });
                    assert.equal(await this.mutableStorageToken._allowances(), this.newAllowances)
                })
                it('emits a ChangedAllowanceStorage event', async function () {
                    const { logs } = await this.mutableStorageToken.setAllowanceStorage(this.newAllowances, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "ChangedAllowanceStorage")
                    assert.equal(logs[0].args._old, this.allowances)
                    assert.equal(logs[0].args._new, this.newAllowances)
                })

                describe('new allowances is a non-contract address', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.mutableStorageToken.setAllowanceStorage(owner, { from }));
                        await expectRevert(this.mutableStorageToken.setAllowanceStorage(ZERO_ADDRESS, { from }));

                    })
                }) 
                describe('new allowances is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.mutableStorageToken.setAllowanceStorage(this.allowances, { from }));

                    })
                }) 
            })

            describe('non-owner calls', function () {

                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.mutableStorageToken.setAllowanceStorage(this.newAllowances, { from }))
                })
            })
        })


    })
}

module.exports = {
    permissionedTokenMutableStorageTests
}
        