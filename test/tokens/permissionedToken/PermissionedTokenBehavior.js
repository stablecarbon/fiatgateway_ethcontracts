const { assertBalance, expectRevert, ZERO_ADDRESS } = require("../../helpers/common");
const { PermissionedToken, Regulator } = require('../../helpers/artifacts');
var BigNumber = require('bignumber.js');

/** Add funds to a nonlisted or blacklisted account 
*   @param accountToSeed nonlisted or blacklisted account to fund
*   @param validator the validator who can set regulator permissions
*   @param minter the account capable of minting coins
*   @status true if account is blacklisted, false if nonlisted
**/
async function seedAccount(tokenAddress, accountToSeed, amountToSeed, validator, minter, status ) {
    const token = await PermissionedToken.at(tokenAddress)
    const regulator = await Regulator.at(token.regulator.address);
    const isNonlisted = await regulator.isNonlistedUser(accountToSeed);
    const isBlacklisted = await regulator.isBlacklistedUser(accountToSeed);
    assert(( isNonlisted || isBlacklisted ));

    await regulator.setWhitelistedUser(accountToSeed, {from:validator});
    await token.mint(accountToSeed, amountToSeed, {from:minter});
    if (status) {
        await regulator.setBlacklistedUser(accountToSeed, {from:validator});
    }
    else {
        await regulator.setNonlistedUser(accountToSeed, {from:validator});
    }
}

function permissionedTokenBehavior(minter, whitelisted, blacklisted, nonlisted, user, validator) {
    describe("Permissioned Token Tests", function () {
        describe('mint', function () {
            const amountToMint = new BigNumber("100000000000000000000") //100e18

            describe('when sender is minter', function () {
                const from = minter

                describe('when user is whitelisted', function () {
                    
                    const to = whitelisted
                    it('mints to whitelisted', async function () {
                        await this.token.mint(to, amountToMint, { from })
                        assertBalance(this.token, to, amountToMint);
                    });
                    
                    it('correctly changes total supply', async function () {
                        await this.token.mint(to, amountToMint, { from })
                        assert((await this.token.totalSupply()).eq(amountToMint));
                    });

                    it('emits Mint and Transfer events', async function () {
                        const { logs } = await this.token.mint(to, amountToMint, { from })
                        assert.equal(logs.length, 2)
                        assert.equal(logs[0].event, 'Mint')
                        assert.equal(logs[0].args.to, whitelisted)
                        assert(logs[0].args.value.eq(amountToMint))
                        assert.equal(logs[1].event, 'Transfer')
                        assert.equal(logs[1].args.from, ZERO_ADDRESS)
                        assert.equal(logs[1].args.to, whitelisted)
                        assert(logs[1].args.value.eq(amountToMint))
                    });
                });
                describe('when user is not whitelisted', function () {

                    afterEach(async function () {
                        assert((await this.token.totalSupply()).eq(0));
                        assertBalance(this.token, to, 0);

                    })

                    describe('when user is nonlisted', function () {
                        it('reverts call', async function () {
                            
                            to = nonlisted
                            await expectRevert(this.token.mint(to, amountToMint, { from }));

                        });
                    });
                    describe('when user is blacklisted', function () {
                        it('reverts call', async function () {
                            
                            to = blacklisted
                            await expectRevert(this.token.mint(to, amountToMint, { from }));

                        });
                    });
                });
            });
            describe('when sender is not minter', function () {
                const from = nonlisted;
                const to = whitelisted;

                afterEach(async function () {
                    assert((await this.token.totalSupply()).eq(0));
                    assertBalance(this.token, to, 0);
                })

                it('reverts mint call', async function () {
                    await expectRevert(this.token.mint(to, amountToMint, { from }));
                });
            });
        });
        
        describe('burn', function () {

            /* Only whitelisted should be able to burn tokens */
            const amountToMint = new BigNumber("100000000000000000000") //100e18
            const amountToBurn = new BigNumber("50000000000000000000") //50e18

            describe('when sender is whitelisted', function () {
                const from = whitelisted

                beforeEach(async function () {
                    await this.token.mint(from, amountToMint, { from: minter });
                })

                it('burns user funds', async function () {
                    await this.token.burn(amountToBurn, { from })
                    assertBalance(this.token, from, amountToMint.minus(amountToBurn));
                });

                it('correctly changes total supply', async function () {
                    await this.token.burn(amountToBurn, { from })
                    assert((await this.token.totalSupply()).eq(amountToMint.minus(amountToBurn)));
                });

                it('emits Burn and Transfer events', async function () {
                    const { logs } = await this.token.burn(amountToBurn, { from })
                    assert.equal(logs.length, 2)
                    assert.equal(logs[0].event, 'Burn')
                    assert.equal(logs[0].args.burner, whitelisted)
                    assert(logs[0].args.value.eq(amountToBurn))
                    assert.equal(logs[1].event, 'Transfer')
                    assert.equal(logs[1].args.from, whitelisted)
                    assert.equal(logs[1].args.to, ZERO_ADDRESS)
                    assert(logs[1].args.value.eq(amountToBurn))
                });

                describe('when the amount is more than the users balance', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.burn(amountToMint.plus(1), { from }));
                        assertBalance(this.token, from, amountToMint);
                    });
                })
            });

            describe('when sender is not whitelisted', function () {

                it('if sender is blacklisted, reverts call', async function () {
                    const from = blacklisted
                    await this.regulator.setWhitelistedUser(from, {from:validator});
                    await this.token.mint(from, amountToMint, {from:minter});
                    await this.regulator.setBlacklistedUser(from, {from:validator});
                    await expectRevert(this.token.burn(amountToBurn, { from }));
                    assertBalance(this.token, from, amountToMint)

                });
                it('if sender is nonlisted reverts call', async function () {
                    const from = nonlisted
                    await this.regulator.setWhitelistedUser(from, {from:validator});
                    await this.token.mint(from, amountToMint, {from:minter});
                    await this.regulator.setNonlistedUser(from, {from:validator});
                    await expectRevert(this.token.burn(amountToBurn, { from }));
                    assertBalance(this.token, from, amountToMint)

                });
            });
        });

        describe('transfer', function () {

            const amountToMint = new BigNumber("100000000000000000000") //100e18
            const amountToTransfer = new BigNumber("50000000000000000000") //50e18

            describe('sender is blacklisted', function () {
                const from = blacklisted
                const to = nonlisted

                beforeEach(async function () {

                    await this.regulator.setWhitelistedUser(from, {from:validator});
                    await this.token.mint(from, amountToMint, {from:minter});
                    await this.regulator.setBlacklistedUser(from, {from:validator});

                })

                it('reverts call', async function () {
                    await expectRevert(this.token.transfer(to, amountToTransfer, { from }));
                    await expectRevert(this.token.transfer(whitelisted, amountToTransfer, { from }));
                });
            });

            describe('sender is nonlisted or whitelisted', function () {

                beforeEach(async function () {

                    await this.regulator.setWhitelistedUser(nonlisted, {from:validator});
                    await this.token.mint(nonlisted, amountToMint, {from:minter});
                    await this.token.mint(whitelisted, amountToMint, {from:minter})
                    await this.regulator.setNonlistedUser(nonlisted, {from:validator});

                }) 

                describe('when receiver is whitelisted or nonlisted', function () {
                    const from = nonlisted
                    const to = whitelisted

                    describe('when sender has enough balance', function () {
                        it('transfer succeeds from nonlisted to whitelisted', async function () {
                            await this.token.transfer(to, amountToTransfer, { from });
                            assertBalance(this.token, from, amountToMint.minus(amountToTransfer));
                            assertBalance(this.token, to, amountToMint.plus(amountToTransfer));
                            assert((await this.token.totalSupply()).eq(amountToMint.times(2)));
                        })

                        it('transfer succeeds from whitelisted to nonlisted', async function () {
                            await this.token.transfer(from, amountToTransfer, { from:to });
                            assertBalance(this.token, to, amountToMint.minus(amountToTransfer));
                            assertBalance(this.token, from, amountToMint.plus(amountToTransfer));
                            assert((await this.token.totalSupply()).eq(amountToMint.times(2)));
                        })
                        it('emits a Transfer event', async function () {
                            const { logs } = await this.token.transfer(to, amountToTransfer, { from })
                            assert.equal(logs.length, 1)
                            assert.equal(logs[0].event, 'Transfer')
                            assert.equal(logs[0].args.from, from)
                            assert.equal(logs[0].args.to, to)
                            assert(logs[0].args.value.eq(amountToTransfer))
                        })
                    })

                    describe('when sender does not have enough balance', function () {
                        const tooMuchToTransfer = amountToTransfer.times(2).plus(1)
                        it('reverts', async function () {
                            await expectRevert(this.token.transfer(from, tooMuchToTransfer, { from }));
                            await expectRevert(this.token.transfer(to, tooMuchToTransfer, { from }));
                            assert((await this.token.totalSupply()).eq(amountToMint.times(2)));
                        })
                    })

                });

                describe('when receiver is blacklisted', function () {
                    const to = blacklisted 

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                        assert((await this.token.totalSupply()).eq(amountToMint.times(2)));
                    });
                });

                describe('when receiver is the zero address', function () {
                    const to = ZERO_ADDRESS

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                        assert((await this.token.totalSupply()).eq(amountToMint.times(2)));
                    })
                })
            });
        });

        describe('approve', function  () {
            const amountToMint = new BigNumber("100000000000000000000") //100e18

            describe('token holder is not blacklisted', function () {

                describe('sender is not blacklisted', function () {

                })

                describe('sender is blacklisted', function () {

                })
            })

            describe('token holder is blacklisted', function () {

                describe('sender is not blacklisted', function () {

                })
            })
        })

        describe('approveBlacklistedAddressSpender', function () {
            
            const amountToMint = new BigNumber("100000000000000000000") //100e18
            const from = validator

            beforeEach(async function () {

                // seed blacklisted account
                await this.regulator.setWhitelistedUser(blacklisted, {from:validator});
                await this.token.mint(blacklisted, amountToMint, {from:minter});
                await this.regulator.setBlacklistedUser(blacklisted, {from:validator});

                // set validator as blacklist spender
                await this.regulator.setBlacklistSpender(from, { from: validator })
                assert(await this.regulator.isBlacklistSpender(from));

            })

            afterEach(async function () {
                assert((await this.token.totalSupply()).eq(amountToMint));
            })

            describe('message sender is a blacklist spender', function () {

                describe('token holder is blacklisted', function () {

                    it('allowance is set properly', async function () {

                        await this.token.approveBlacklistedAddressSpender(blacklisted, { from });
                        assert((await this.token.allowance(blacklisted, from)).eq(amountToMint));

                    })
                    it('emits a ApprovedBlacklistedAddressSpender event', async function () {
                        const { logs } = await this.token.approveBlacklistedAddressSpender(blacklisted, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'ApprovedBlacklistedAddressSpender');
                        assert.equal(logs[0].args.owner, blacklisted);
                        assert.equal(logs[0].args.spender, from);
                        assert(logs[0].args.value.eq(amountToMint));
                    })
                })

                describe('token holder is not blacklisted', function () {

                    it('reverts', async function () {

                        await expectRevert(this.token.approveBlacklistedAddressSpender(nonlisted, { from }));
                        await expectRevert(this.token.approveBlacklistedAddressSpender(whitelisted, { from }));
                    })
                })
            })

            describe('message sender is NOT a blacklist spender', function () {

                describe('token holder is blacklisted', function () {
                    
                    it('reverts', async function () {
                        await this.regulator.removeBlacklistSpender(from, { from: validator })
                        await expectRevert(this.token.approveBlacklistedAddressSpender(blacklisted, { from }));
                    })

                })

                describe('token holder is not blacklisted', function () {
                    
                    it('reverts', async function () {
                        await this.regulator.removeBlacklistSpender(from, { from: validator })
                        await expectRevert(this.token.approveBlacklistedAddressSpender(nonlisted, { from }));
                        await expectRevert(this.token.approveBlacklistedAddressSpender(whitelisted, { from }));

                    })

                })
            })
        })

        describe('transferFrom', function () {
            const amountToMint = new BigNumber("100000000000000000000") //100e18
            const amountToTransferFrom = new BigNumber("50000000000000000000") //50e18
            const spender = user

            describe('token holder is not blacklisted', function () {

                describe('function caller is approved to transferFrom token holder account', function () {
                    beforeEach(async function () {

                        // seed token holder account
                        await this.token.mint(whitelisted, amountToMint, {from:minter})

                        // approve spender to transfer from nonlisted and whitelisted accounts
                        await this.token.approve(spender, amountToTransferFrom, {from:whitelisted})

                    })

                    afterEach(async function () {
                        assert((await this.token.totalSupply()).eq(amountToMint));
                    })

                    describe('token holder has enough funds', function () {
                        it('transfer succeeds', async function () {
                            await this.token.transferFrom(whitelisted, nonlisted, amountToTransferFrom, { from: spender });

                            assertBalance(this.token, whitelisted, amountToMint.minus(amountToTransferFrom));
                            assertBalance(this.token, nonlisted, amountToTransferFrom);
                        });
                        it('emits a Transfer event', async function () {
                            const { logs } = await this.token.transferFrom(whitelisted, nonlisted, amountToTransferFrom, { from: spender})
                            assert.equal(logs.length, 1)
                            assert.equal(logs[0].event, 'Transfer')
                            assert.equal(logs[0].args.from, whitelisted)
                            assert.equal(logs[0].args.to, nonlisted)
                            assert(logs[0].args.value.eq(amountToTransferFrom))
                        });
                    });

                    describe('spender does not have enough allowance', function () {
                       
                        it('reverts', async function () {
                            await expectRevert(this.token.transferFrom(whitelisted, nonlisted, amountToTransferFrom.plus(1), { from: spender }));
                        });

                    });
                });

                describe('function caller is NOT approved to transferFrom token holder account', function () {
                    
                    beforeEach(async function () {

                        // seed token holder account
                        await this.token.mint(whitelisted, amountToMint, {from:minter})

                    })

                    afterEach(async function () {
                        assert((await this.token.totalSupply()).eq(amountToMint));
                    })

                    it('reverts', async function () {
                        await expectRevert(this.token.transferFrom(whitelisted, nonlisted, amountToTransferFrom, {from: spender}));
                    });
                });
            });

            describe('token holder is blacklisted', function () {
                const from = blacklisted
                const blacklistedSpender = validator
                const to = nonlisted

                beforeEach(async function () {

                    // seed blacklisted account
                    await this.regulator.setWhitelistedUser(from, {from:validator});
                    await this.token.mint(from, amountToMint, {from:minter});
                    await this.regulator.setBlacklistedUser(from, {from:validator});

                    // approve sender for moving blacklisted tokens
                    await this.regulator.setBlacklistSpender(blacklistedSpender, {from:validator});
                    assert(await this.regulator.isBlacklistSpender(blacklistedSpender))

                })

                afterEach(async function () {
                    assert((await this.token.totalSupply()).eq(amountToMint));
                })

                describe('function caller is approved to spend from a blacklisted account', function () {

                    it('transferFrom succeeds', async function () {
                        await this.token.approveBlacklistedAddressSpender(from, { from:blacklistedSpender });
                        await this.token.transferFrom( from, to, amountToTransferFrom, { from:blacklistedSpender } )
                        assertBalance(this.token, to, amountToTransferFrom)
                        assertBalance(this.token, from, amountToMint.minus(amountToTransferFrom))
                    })

                })

                describe('function caller is NOT approved to spend from a blacklisted account', function () {

                    it('reverts', async function () {
                        await expectRevert(this.token.transferFrom( from, to, amountToTransferFrom, { from:blacklistedSpender } ));
                    })

                })

            });
        });
        // describe('destroyBlacklistedTokens', function () {
        //     describe('sender has the ability to destroy tokens from blacklisted accounts', function () {
        //         it('tokens are destroyed', async function () {
        //             await this.token.destroyBlacklistedTokens(blacklisted, { from: nonlisted });
        //         });
        //         it('emits destroyed blacklisted tokens event', async function () {
        //             depositFunds(this.token, blacklisted, 50 * 10 ** 18, true);
        //             const {logs} = await this.token.destroyBlacklistedTokens(blacklisted, { from: nonlisted });
        //             assert.equal(logs.length, 1);
        //             assert.equal(logs[0].event, 'DestroyedBlacklistedTokens');
        //             assert.equal(logs[0].args._who, blacklisted);
        //             assert.equal(logs[0].args.balance, 50*10**18);
        //         });
        //     });
        //     describe('sender does not have the ability to destroy tokens from blacklisted accounts', function () {
        //         it('reverts call', async function () {
        //             await expectRevert(this.token.destroyBlacklistedTokens(blacklisted, { from: nonlisted }));
        //         });
        //     });
        // });
        // describe('addBlacklistedAddressSpender', function () {
        //     describe('sender has the ability to add themselves as a spender on blacklisted accounts', function () {
        //         it('sender is added as a spender', async function () {
        //             depositFunds(this.token, blacklisted, 50 * 10 ** 18, true);
        //             await this.token.addBlacklistedAddressSpender(blacklisted, { from: validator });
        //             assert.equal(await this.token.allowance(blacklisted, validator), 50*10**18);
        //         });
        //         it('emits added blacklisted spender event', async function () {
        //             depositFunds(this.token, blacklisted, 50 * 10 ** 18, true);
        //             const { logs } = await this.token.addBlacklistedAddressSpender(blacklisted, { from: validator });
        //             assert.equal(logs.length, 1);
        //             assert.equal(logs[0].event, 'AddedBlacklistedAddressSpender');
        //             assert.equal(logs[0].args.account, blacklisted);
        //             assert.equal(logs[0].args.spender, validator);
        //         });
        //     });
        //     describe('sender does not have the ability to add themselves as a spender on blacklisted accounts', function () {
        //         it('reverts call', async function () {
        //             depositFunds(this.token, blacklisted, 50 * 10 ** 18, false);
        //             await expectRevert(this.token.addBlacklistedAddressSpender(blacklisted, { from: validator }));
        //         });
        //     });
        // });
        // describe('blacklisted', function () {
        //     describe('user that is blacklisted calls function', function () {
        //         it('call succeeds', async function () {
        //             assert(await this.token.blacklisted({from : blacklisted}));
        //         });
        //     });
        //     describe('user that is not blacklisted calls function', function () {
        //         it('call reverts', async function () {
        //             await expectRevert(this.token.blacklisted({ from: nonlisted }));
        //             await expectRevert(this.token.blacklisted({ from: whitelisted }));
        //         });
        //     });
        // });
    });
}

module.exports = {
    permissionedTokenBehavior
}