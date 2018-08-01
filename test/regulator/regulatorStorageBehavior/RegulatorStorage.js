const { expectRevert } = require('../../helpers/common');

function regulatorStorageTests(owner, user, attacker, validator, validator2) {

	describe('RegulatorStorage behavior tests', function () {

		beforeEach(async function () {
			// Test permission
			this.testPermission = 0x12345678;
			this.testPermissionName = "Test Permission";
			this.testPermissionDescription = "A test permission description.";
			this.testPermissionContract = "TestContract.sol";
		})

	    describe('Permissions CRUD tests', function () {


	        describe('addPermission', function () {
	        	describe('owner calls', function () {
	        		const from = owner

	        		it("adds the permission with correct attributes", async function() {
		                await this.permissionSheet.addPermission(this.testPermission, 
		                                            this.testPermissionName, 
		                                            this.testPermissionDescription, 
		                                            this.testPermissionContract, { from });
		                assert(await this.permissionSheet.isPermission(this.testPermission));
		                const permissions = await this.permissionSheet.permissions(this.testPermission);
		                assert.equal(permissions[0], this.testPermissionName);
		                assert.equal(permissions[1], this.testPermissionDescription);
		                assert.equal(permissions[2], this.testPermissionContract);
		            })
		            it("emits a permission added event", async function() {
		                const { logs } = await this.permissionSheet.addPermission(this.testPermission, 
		                                                            this.testPermissionName, 
		                                                            this.testPermissionDescription, 
		                                                            this.testPermissionContract, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'PermissionAdded');
		                assert.equal(logs[0].args.methodsignature, this.testPermission);
		            })

	        	})

	        	describe('non owner calls', function () {
	        		const from = user

	        		it('reverts', async function () {
	        			await expectRevert(this.permissionSheet.addPermission(this.testPermission, this.testPermissionName, this.testPermissionDescription, this.testPermissionContract, { from }))
	        		})
	        	})

	        })

	        describe('removePermission', function () {
	        	beforeEach(async function () {
	                await this.permissionSheet.addPermission(this.testPermission, 
	                            this.testPermissionName, 
	                            this.testPermissionDescription, 
	                            this.testPermissionContract, { from:owner });
	                assert(await this.permissionSheet.isPermission(this.testPermission));
	        	})

	        	describe('owner calls', function () {
	        		const from = owner
					it("removes the permission", async function () {
		                // second, remove the permission
		                await this.permissionSheet.removePermission(this.testPermission, { from });
		                const hasPermission = await this.permissionSheet.isPermission(this.testPermission);
		                assert(!hasPermission);
		            })
		            it("emits a permission removed event", async function () {
		                const { logs } = await this.permissionSheet.removePermission(this.testPermission, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'PermissionRemoved');
		                assert.equal(logs[0].args.methodsignature, this.testPermission);
		            })

	        	})

	        	describe('non-owner calls', function () {
	        		const from = user

	        		it('reverts', async function () {
	        			await expectRevert(this.permissionSheet.removePermission(this.testPermission, { from }))
	        		})
	        	})
	        })

	        describe('setUserPermission', function () {

	            describe('adds permission first', function () {
	                
	                beforeEach(async function () {
	                    
	                    // Add as possible permission before setting any user permissions
	                    await this.permissionSheet.addPermission(this.testPermission, 
	                        this.testPermissionName, 
	                        this.testPermissionDescription, 
	                        this.testPermissionContract, { from:owner });
	                })

	                describe('owner calls', function () {
	                	const from = owner

		                it('sets the user permission', async function() {
		                
		                    assert(await this.permissionSheet.isPermission(this.testPermission));

		                    await this.permissionSheet.setUserPermission(user, this.testPermission, { from });
		                    const userHasPermission = await this.permissionSheet.hasUserPermission(user, this.testPermission);
		                    assert(userHasPermission);

		                })

		                it('emits a SetUserPermission event', async function () {

		                    assert(await this.permissionSheet.isPermission(this.testPermission));

		                    const {logs} =  await this.permissionSheet.setUserPermission(user, this.testPermission, { from });

		                    assert.equal(logs.length, 1);
		                    assert.equal(logs[0].event, 'SetUserPermission');
		                    assert.equal(logs[0].args.who, user);
		                    assert.equal(logs[0].args.methodsignature, this.testPermission);

		                })

		                describe('does not add a permission first', function () {

			                it('reverts', async function () {
			                	await this.permissionSheet.removePermission(this.testPermission, { from })
			                    permissionSet = await this.permissionSheet.isPermission(this.testPermission);
			                    assert(!permissionSet);

			                    await expectRevert(this.permissionSheet.setUserPermission(user, this.testPermission, { from }));
			                })
			            })

	                })

	                describe('non-owner calls', function () {

	                	const from = user

	                	it('reverts', async function () {
	                		await expectRevert(this.permissionSheet.setUserPermission(user, this.testPermission, {from}))
	                	})
	                })



	            })
	            
	        })

	        describe('removeUserPermission', function () {
	            
	            beforeEach(async function () {
	                
	                // add as possible permission
	                await this.permissionSheet.addPermission(this.testPermission, 
	                    this.testPermissionName, 
	                    this.testPermissionDescription, 
	                    this.testPermissionContract, { from:owner });

	                // set user permission
	                await this.permissionSheet.setUserPermission(user, this.testPermission, { from:owner });
	            })

	            describe('owner calls', function () {
	            	const from = owner

	            	it('removes the user permission', async function () {

		                assert(await this.permissionSheet.isPermission(this.testPermission));
		                const userHasPermission = await this.permissionSheet.hasUserPermission(user, this.testPermission);
		                assert(userHasPermission);

		                await this.permissionSheet.removeUserPermission(user, this.testPermission, { from });
		                const userNowHasPermission = await this.permissionSheet.hasUserPermission(user, this.testPermission);
		                assert(!userNowHasPermission);

		            })

		            it('emits a RemovedUserPermission event', async function () {

		                const { logs } = await this.permissionSheet.removeUserPermission(user, this.testPermission, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'RemovedUserPermission');
		                assert.equal(logs[0].args.who, user);
		                assert.equal(logs[0].args.methodsignature, this.testPermission);

		            })

	            })

	            describe('non owner calls', function () {

	            	const from = user
	            	it('reverts', async function () {
	            		await expectRevert(this.permissionSheet.removeUserPermission(user, this.testPermission, { from }));

	            	})
	            })

	        })
	    })

	    describe('Validators CRUD tests', function () {

	        describe('addValidator', function () {

	        	describe('owner calls', function () {

	        		const from = owner
	        		beforeEach(async function () {
		                // assert that validator is not validator upon initialization
		                validatorAddedBefore = await this.validatorSheet.isValidator(validator);
		                assert(!validatorAddedBefore);
		            })

		            it("adds one validator", async function () {
		                await this.validatorSheet.addValidator(validator, { from });
		                assert(await this.validatorSheet.isValidator(validator));
		            })
		            it("adds two validators", async function () {
		                await this.validatorSheet.addValidator(validator, { from });
		                await this.validatorSheet.addValidator(validator2, { from });
		                assert(await this.validatorSheet.isValidator(validator));
		                assert(await this.validatorSheet.isValidator(validator2));
		            })
		            it("emits a validator added event", async function () {
		                const { logs } = await this.validatorSheet.addValidator(validator, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'ValidatorAdded');
		                assert.equal(logs[0].args.validator, validator);
		            })
	        	})

	        	describe('non owner calls', function () {

	        		const from = user
	        		it('reverts', async function () {

	        			await expectRevert(this.validatorSheet.addValidator(validator, {from}))
	        		})
	        	})
	            
	
	        })

	        describe('removeValidator', function () {
	        		            
	            beforeEach(async function () {
	            	// add validator to be removed

	                await this.validatorSheet.addValidator(validator, { from:owner });
	                assert(await this.validatorSheet.isValidator(validator));
	            })

	            describe('owner calls', function () {
	            	const from = owner

		            it("removes the validator", async function () {
		                await this.validatorSheet.removeValidator(validator, { from });
		                const validated = await this.validatorSheet.isValidator(validator);
		                assert(!validated);
		            })
		            it("emits a validator removed event", async function () {
		                const { logs } = await this.validatorSheet.removeValidator(validator, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'ValidatorRemoved');
		                assert.equal(logs[0].args.validator, validator);
		            })
	            })

	            describe('non owner calls', function () {

	            	const from = user
	            	it('reverts', async function () {
	            		await expectRevert(this.validatorSheet.removeValidator(validator, { from }))
	            	})
	            })

	        })
	    })

	})
}

module.exports = {
    regulatorStorageTests
}