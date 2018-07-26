const { expectRevert } = require("../../helpers/common");

const { Regulator } = require("../../helpers/artifacts")

function permissionedTokenStorage(owner, nonOwner) {
    describe("Permissioned Token Regulator setting/getting tests", function () {

    	describe('setRegulator', function () {

    		const from = owner
    		beforeEach(async function () {
        		assert.equal(await this.token.regulator(), this.regulator.address);
        		this.oldRegulator = await this.token.regulator()

        		// create a new regulator
        		this.newRegulator = (await Regulator.new({ from })).address
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
    				assert.equal(logs[0].args.oldProxy, this.oldRegulator)
    				assert.equal(logs[0].args.newProxy, this.newRegulator)
    			})

   				describe('new regulator is a non-contract address', function () {
   					it('reverts', async function() {
   						await expectRevert(this.token.setRegulator(owner, { from }));
   						assert.equal(await this.token.regulator(), this.oldRegulator)

   					})
   				}) 
    		})

    		describe('non-owner calls', function () {

    			const from = nonOwner
    			it('reverts', async function () {
    				await expectRevert(this.token.setRegulator(this.newRegulator, { from }))
    				assert.equal(await this.token.regulator(), this.oldRegulator)
    			})
    		})
    	})
    })
}

module.exports = {
    permissionedTokenStorage
}
        