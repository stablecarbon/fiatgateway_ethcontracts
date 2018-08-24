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

	    	beforeEach(async function () {
	    		await this.storage.addValidator(owner, {from:owner})
	    	})
	        describe('addPermission', function () {
	        	describe('validator calls', function () {
	        		const from = owner

	        		it("adds the permission with correct attributes", async function() {
		                await this.storage.addPermission(this.testPermission, 
		                                            this.testPermissionName, 
		                                            this.testPermissionDescription, 
		                                            this.testPermissionContract, { from });
		                assert(await this.storage.isPermission(this.testPermission));
		                const permissions = await this.storage.permissions(this.testPermission);
		                assert.equal(permissions[0], this.testPermissionName);
		                assert.equal(permissions[1], this.testPermissionDescription);
		                assert.equal(permissions[2], this.testPermissionContract);
		            })
		            it("emits a permission added event", async function() {
		                const { logs } = await this.storage.addPermission(this.testPermission, 
		                                                            this.testPermissionName, 
		                                                            this.testPermissionDescription, 
		                                                            this.testPermissionContract, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'PermissionAdded');
		                assert.equal(logs[0].args.methodsignature, this.testPermission);
		            })

	        	})

	        	describe('non validator calls', function () {
	        		const from = user

	        		it('reverts', async function () {
	        			await expectRevert(this.storage.addPermission(this.testPermission, this.testPermissionName, this.testPermissionDescription, this.testPermissionContract, { from }))
	        		})
	        	})

	        })

	        describe('removePermission', function () {
	        	beforeEach(async function () {
	                await this.storage.addPermission(this.testPermission, 
	                            this.testPermissionName, 
	                            this.testPermissionDescription, 
	                            this.testPermissionContract, { from:owner });
	                assert(await this.storage.isPermission(this.testPermission));
	        	})

	        	describe('validator calls', function () {
	        		const from = owner
					it("removes the permission", async function () {
		                // second, remove the permission
		                await this.storage.removePermission(this.testPermission, { from });
		                const hasPermission = await this.storage.isPermission(this.testPermission);
		                assert(!hasPermission);
		            })
		            it("emits a permission removed event", async function () {
		                const { logs } = await this.storage.removePermission(this.testPermission, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'PermissionRemoved');
		                assert.equal(logs[0].args.methodsignature, this.testPermission);
		            })

	        	})

	        	describe('non-validator calls', function () {
	        		const from = user

	        		it('reverts', async function () {
	        			await expectRevert(this.storage.removePermission(this.testPermission, { from }))
	        		})
	        	})
	        })

	        describe('getPermission', function () {
	        	it('retrieves permission fields, permission should be active', async function () {
	                await this.storage.addPermission(this.testPermission, 
	                                            	this.testPermissionName, 
	                                            	this.testPermissionDescription, 
	                                            	this.testPermissionContract, { from: owner });
	                const permission = await this.storage.getPermission(this.testPermission);
	                assert.equal(permission[0], this.testPermissionName)
	                assert.equal(permission[1], this.testPermissionDescription)
	                assert.equal(permission[2], this.testPermissionContract)
	                assert(permission[3])      	
	            })
	        })

	        describe('setUserPermission', function () {

	            describe('adds permission first', function () {
	                
	                beforeEach(async function () {
	                    
	                    // Add as possible permission before setting any user permissions
	                    await this.storage.addPermission(this.testPermission, 
	                        this.testPermissionName, 
	                        this.testPermissionDescription, 
	                        this.testPermissionContract, { from:owner });
	                })

	                describe('validator calls', function () {
	                	const from = owner

		                it('sets the user permission', async function() {
		                
		                    assert(await this.storage.isPermission(this.testPermission));

		                    await this.storage.setUserPermission(user, this.testPermission, { from });
		                    const userHasPermission = await this.storage.hasUserPermission(user, this.testPermission);
		                    assert(userHasPermission);

		                })

		                describe('does not add a permission first', function () {

			                it('reverts', async function () {
			                	await this.storage.removePermission(this.testPermission, { from })
			                    permissionSet = await this.storage.isPermission(this.testPermission);
			                    assert(!permissionSet);

			                    await expectRevert(this.storage.setUserPermission(user, this.testPermission, { from }));
			                })
			            })

	                })

	                describe('non-validator calls', function () {

	                	const from = user

	                	it('reverts', async function () {
	                		await expectRevert(this.storage.setUserPermission(user, this.testPermission, {from}))
	                	})
	                })

	            })

	        })

	        describe('removeUserPermission', function () {
	            
	            describe('adds Permission first', function () {
		            beforeEach(async function () {
		                
		                // add as possible permission
		                await this.storage.addPermission(this.testPermission, 
		                    this.testPermissionName, 
		                    this.testPermissionDescription, 
		                    this.testPermissionContract, { from:owner });

		                // set user permission
		                await this.storage.setUserPermission(user, this.testPermission, { from:owner });
		            })
			        describe('validator calls', function () {
		            	const from = owner

		            	it('removes the user permission', async function () {

			                assert(await this.storage.isPermission(this.testPermission));
			                const userHasPermission = await this.storage.hasUserPermission(user, this.testPermission);
			                assert(userHasPermission);

			                await this.storage.removeUserPermission(user, this.testPermission, { from });
			                const userNowHasPermission = await this.storage.hasUserPermission(user, this.testPermission);
			                assert(!userNowHasPermission);

			            })

		            })

		            describe('non validator calls', function () {

		            	const from = user
		            	it('reverts', async function () {
		            		await expectRevert(this.storage.removeUserPermission(user, this.testPermission, { from }));

		            	})
		            })

	            })
	            describe('does not add Permission first', function () {
	            	it('reverts', async function () {
	            		await expectRevert(this.storage.removeUserPermission(user, this.testPermission, {from:owner}))
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
		                validatorAddedBefore = await this.storage.isValidator(validator);
		                assert(!validatorAddedBefore);
		            })

		            it("adds one validator", async function () {
		                await this.storage.addValidator(validator, { from });
		                assert(await this.storage.isValidator(validator));
		            })
		            it("adds two validators", async function () {
		                await this.storage.addValidator(validator, { from });
		                await this.storage.addValidator(validator2, { from });
		                assert(await this.storage.isValidator(validator));
		                assert(await this.storage.isValidator(validator2));
		            })
		            it("emits a validator added event", async function () {
		                const { logs } = await this.storage.addValidator(validator, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'ValidatorAdded');
		                assert.equal(logs[0].args.validator, validator);
		            })
	        	})

	        	describe('non owner calls', function () {

	        		const from = user
	        		it('reverts', async function () {

	        			await expectRevert(this.storage.addValidator(validator, {from}))
	        		})
	        	})
	            
	
	        })

	        describe('removeValidator', function () {
	        		            
	            beforeEach(async function () {
	            	// add validator to be removed

	                await this.storage.addValidator(validator, { from:owner });
	                assert(await this.storage.isValidator(validator));
	            })

	            describe('owner calls', function () {
	            	const from = owner

		            it("removes the validator", async function () {
		                await this.storage.removeValidator(validator, { from });
		                const validated = await this.storage.isValidator(validator);
		                assert(!validated);
		            })
		            it("emits a validator removed event", async function () {
		                const { logs } = await this.storage.removeValidator(validator, { from });
		                assert.equal(logs.length, 1);
		                assert.equal(logs[0].event, 'ValidatorRemoved');
		                assert.equal(logs[0].args.validator, validator);
		            })
	            })

	            describe('non owner calls', function () {

	            	const from = user
	            	it('reverts', async function () {
	            		await expectRevert(this.storage.removeValidator(validator, { from }))
	            	})
	            })

	        })
	    })

	})
}

module.exports = {
    regulatorStorageTests
}