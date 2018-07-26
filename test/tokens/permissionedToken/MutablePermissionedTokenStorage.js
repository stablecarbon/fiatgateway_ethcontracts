const { expectRevert } = require("../../helpers/common");
const { AllowanceSheet, BalanceSheet } = require("../../helpers/artifacts")

function mutablePermissionedTokenStorage(owner, nonOwner) {
    describe("Mutable Permissioned Token allowance/balance sheet setting/getting tests", function () {

    	describe('setAllowanceSheet', function () {
    		const from = owner
    		beforeEach(async function () {
        		assert.equal(await this.token.allowances(), this.allowances.address);
        		this.oldAllowanceSheet = await this.token.allowances()
        		this.newAllowanceSheet = (await AllowanceSheet.new({ from })).address
    		})

    		describe('owner calls', function () {
    			it('sets allowance sheet', async function () {
					await this.token.setAllowanceSheet(this.newAllowanceSheet, { from });
					assert.equal(await this.token.allowances(), this.newAllowanceSheet)
    			})
    			it('emits a AllowanceSheetChanged event', async function () {
					const { logs } = await this.token.setAllowanceSheet(this.newAllowanceSheet, { from });
    				assert.equal(logs.length, 1)
					assert.equal(logs[0].event, "AllowanceSheetChanged")
    				assert.equal(logs[0].args.oldSheet, this.oldAllowanceSheet)
					assert.equal(logs[0].args.newSheet, this.newAllowanceSheet)
    			})

   				describe('new sheet is not a contract', function () {
   					it('reverts', async function() {
   						await expectRevert(this.token.setAllowanceSheet(nonOwner, { from }));
						assert.equal(await this.token.allowances(), this.oldAllowanceSheet)
   					})
   				}) 
    		})
    		describe('non-owner calls', function () {
    			const from = nonOwner
    			it('reverts', async function () {
    				await expectRevert(this.token.setAllowanceSheet(this.newAllowanceSheet, { from }))
    				assert.equal(await this.token.allowances(), this.oldAllowanceSheet)
    			})
    		})
		})
		
		describe('setBalanceSheet', function () {
			const from = owner
			beforeEach(async function () {
				assert.equal(await this.token.balances(), this.balances.address);
				this.oldBalanceSheet = await this.token.balances()
				this.newBalanceSheet = (await BalanceSheet.new({ from })).address
			})

			describe('owner calls', function () {
				it('sets allowance sheet', async function () {
					await this.token.setBalanceSheet(this.newBalanceSheet, { from });
					assert.equal(await this.token.balances(), this.newBalanceSheet)
				})
				it('emits a BalanceSheetChanged event', async function () {
					const { logs } = await this.token.setBalanceSheet(this.newBalanceSheet, { from });
					assert.equal(logs.length, 1)
					assert.equal(logs[0].event, "BalanceSheetChanged")
					assert.equal(logs[0].args.oldSheet, this.oldBalanceSheet)
					assert.equal(logs[0].args.newSheet, this.newBalanceSheet)
				})

				describe('new sheet is not a contract', function () {
					it('reverts', async function () {
						await expectRevert(this.token.setBalanceSheet(nonOwner, { from }));
						assert.equal(await this.token.balances(), this.oldBalanceSheet)
					})
				})
			})
			describe('non-owner calls', function () {
				const from = nonOwner
				it('reverts', async function () {
					await expectRevert(this.token.setBalanceSheet(this.newBalanceSheet, { from }))
					assert.equal(await this.token.balances(), this.oldBalanceSheet)
				})
			})
		})
    })
}

module.exports = {
    mutablePermissionedTokenStorage
}
        