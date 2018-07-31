const { expectRevert, ZERO_ADDRESS } = require("../../../helpers/common");

const { BalanceSheet, AllowanceSheet, Regulator } = require("../../../helpers/artifacts");

const { PermissionSheetMock, ValidatorSheetMock } = require('../../../helpers/mocks');


function permissionedTokenMutableStorageTests(owner, nonOwner) {
    describe("Permissioned Token Storage setting/getting tests", function () {

        beforeEach(async function () {
            // Initial Token storages
            this.oldBalances = await this.token.balances()
            this.oldAllowances = await this.token.allowances()
            this.oldRegulator = await this.token.regulator()
        })
    	describe('setRegulator', function () {

    		const from = owner
    		beforeEach(async function () {
                // create a new regulator loaded with all permissions
                this.newPermissions = await PermissionSheetMock.new({from})
                this.newValidators = await ValidatorSheetMock.new(owner, {from})
                this.newRegulator = (await Regulator.new(this.newPermissions.address, this.newValidators.address)).address
            })

    		describe('owner calls', function () {
    			it('changes regulator', async function () {
    				await this.token.setRegulator(this.newRegulator, { from });
    				assert.equal(await this.token.regulator(), this.newRegulator)
    			})
    			it('emits a ChangedRegulator event', async function () {
    				const { logs } = await this.token.setRegulator(this.newRegulator, { from })
    				assert.equal(logs.length, 1)
    				assert.equal(logs[0].event, "ChangedRegulator")
    				assert.equal(logs[0].args._old, this.oldRegulator)
    				assert.equal(logs[0].args._new, this.newRegulator)
    			})

   				describe('new regulator is a non-contract address', function () {
   					it('reverts', async function() {
   						
                        await expectRevert(this.token.setRegulator(owner, { from }));
                        await expectRevert(this.token.setRegulator(ZERO_ADDRESS, { from }));

   					})
   				}) 
                describe('new regulator is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.token.setRegulator(this.oldRegulator, { from }));

                    })
                }) 
    		})

    		describe('non-owner calls', function () {

    			const from = nonOwner
    			it('reverts', async function () {
    				await expectRevert(this.token.setRegulator(this.newRegulator, { from }))
    			})
    		})
    	})

        describe('setBalanceStorage', function () {

            const from = owner
            beforeEach(async function () {
            
                // new balance sheet
                this.newBalances = (await BalanceSheet.new({from})).address

            })

            describe('owner calls', function () {
                it('changes balance sheet', async function () {
                    await this.token.setBalanceStorage(this.newBalances, { from });
                    assert.equal(await this.token.balances(), this.newBalances)
                })
                it('emits a ChangedBalanceStorage event', async function () {
                    const { logs } = await this.token.setBalanceStorage(this.newBalances, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "ChangedBalanceStorage")
                    assert.equal(logs[0].args._old, this.oldBalances)
                    assert.equal(logs[0].args._new, this.newBalances)
                })

                describe('new balances is a non-contract address', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.token.setBalanceStorage(owner, { from }));
                        await expectRevert(this.token.setBalanceStorage(ZERO_ADDRESS, { from }));

                    })
                }) 
                describe('new balances is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.token.setBalanceStorage(this.oldBalances, { from }));

                    })
                }) 
            })

            describe('non-owner calls', function () {

                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.token.setBalanceStorage(this.newBalances, { from }))
                })
            })
        })

        describe('setAllowanceStorage', function () {

            const from = owner
            beforeEach(async function () {
            
                // new allowances sheet
                this.newAllowances = (await AllowanceSheet.new({from})).address

            })

            describe('owner calls', function () {
                it('changes allowance sheet', async function () {
                    await this.token.setAllowanceStorage(this.newAllowances, { from });
                    assert.equal(await this.token.allowances(), this.newAllowances)
                })
                it('emits a ChangedAllowanceStorage event', async function () {
                    const { logs } = await this.token.setAllowanceStorage(this.newAllowances, { from })
                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, "ChangedAllowanceStorage")
                    assert.equal(logs[0].args._old, this.oldAllowances)
                    assert.equal(logs[0].args._new, this.newAllowances)
                })

                describe('new allowances is a non-contract address', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.token.setAllowanceStorage(owner, { from }));
                        await expectRevert(this.token.setAllowanceStorage(ZERO_ADDRESS, { from }));

                    })
                }) 
                describe('new allowances is same regulator', function () {
                    it('reverts', async function() {
                        
                        await expectRevert(this.token.setAllowanceStorage(this.oldAllowances, { from }));

                    })
                }) 
            })

            describe('non-owner calls', function () {

                const from = nonOwner
                it('reverts', async function () {
                    await expectRevert(this.token.setAllowanceStorage(this.newAllowances, { from }))
                })
            })
        })


    })
}

module.exports = {
    permissionedTokenMutableStorageTests
}
        