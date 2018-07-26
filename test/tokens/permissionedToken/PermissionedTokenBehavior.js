const { assertBalance, expectRevert, ZERO_ADDRESS } = require("../../helpers/common");

function permissionedTokenBehavior(minter, whitelisted, blacklisted, nonlisted, user, validator) {
    describe("Permissioned Token Behavior Tests", function () {
        
        describe('mint', function () {
            const amountToMint = 100 * 10 ** 18

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
                        assert.equal(await this.token.totalSupply(), amountToMint);
                    });

                    it('emits Mint and Transfer events', async function () {
                        const { logs } = await this.token.mint(to, amountToMint, { from })
                        assert.equal(logs.length, 2)
                        assert.equal(logs[0].event, 'Mint')
                        assert.equal(logs[0].args.to, whitelisted)
                        assert.equal(logs[0].args.value, amountToMint)
                        assert.equal(logs[1].event, 'Transfer')
                        assert.equal(logs[1].args.from, ZERO_ADDRESS)
                        assert.equal(logs[1].args.to, whitelisted)
                        assert.equal(logs[1].args.value, amountToMint)
                    });
                });
                describe('when user is not whitelisted', function () {

                    afterEach(async function () {
                        assert.equal(await this.token.totalSupply(), 0);
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
                    assert.equal(await this.token.totalSupply(), 0);
                    assertBalance(this.token, to, 0);
                })

                it('reverts mint call', async function () {
                    await expectRevert(this.token.mint(to, amountToMint, { from }));
                });
            });
        });

        describe('burn', function () {

            /* Only whitelisted should be able to burn tokens */
            const amountToMint = 100 * 10 ** 18
            const amountToBurn = 50 * 10 ** 18

            describe('when sender is whitelisted', function () {
                const from = whitelisted

                beforeEach(async function () {
                    await this.token.mint(from, amountToMint, { from: minter });
                })

                it('burns user funds', async function () {
                    await this.token.burn(amountToBurn, { from })
                    assertBalance(this.token, from, amountToMint-amountToBurn);
                });

                it('correctly changes total supply', async function () {
                    await this.token.burn(amountToBurn, { from })
                    assert.equal(await this.token.totalSupply(), amountToMint-amountToBurn);
                });

                it('emits Burn and Transfer events', async function () {
                    const { logs } = await this.token.burn(amountToBurn, { from })
                    assert.equal(logs.length, 2)
                    assert.equal(logs[0].event, 'Burn')
                    assert.equal(logs[0].args.burner, whitelisted)
                    assert.equal(logs[0].args.value, amountToBurn)
                    assert.equal(logs[1].event, 'Transfer')
                    assert.equal(logs[1].args.from, whitelisted)
                    assert.equal(logs[1].args.to, ZERO_ADDRESS)
                    assert.equal(logs[1].args.value, amountToBurn)
                });

                describe('when the amount is more than the users balance', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.burn(amountToMint+1, { from }));
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

            const amountToMint = 100 * 10 ** 18
            const amountToTransfer = 50 * 10 ** 18

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
                            assertBalance(this.token, from, amountToMint-amountToTransfer);
                            assertBalance(this.token, to, amountToMint+amountToTransfer);
                            assert.equal(await this.token.totalSupply(), amountToMint*2);
                        })

                        it('transfer succeeds from whitelisted to nonlisted', async function () {
                            await this.token.transfer(from, amountToTransfer, { from:to });
                            assertBalance(this.token, to, amountToMint-amountToTransfer);
                            assertBalance(this.token, from, amountToMint+amountToTransfer);
                            assert.equal(await this.token.totalSupply(), amountToMint*2);
                        })
                        it('emits a Transfer event', async function () {
                            const { logs } = await this.token.transfer(to, amountToTransfer, { from })
                            assert.equal(logs.length, 1)
                            assert.equal(logs[0].event, 'Transfer')
                            assert.equal(logs[0].args.from, from)
                            assert.equal(logs[0].args.to, to)
                            assert.equal(logs[0].args.value, amountToTransfer)
                        })
                    })

                    describe('when sender does not have enough balance', function () {
                        const tooMuchToTransfer = amountToTransfer*2+1
                        it('reverts', async function () {
                            await expectRevert(this.token.transfer(from, tooMuchToTransfer, { from }));
                            await expectRevert(this.token.transfer(to, tooMuchToTransfer, { from }));
                            assert.equal(await this.token.totalSupply(), amountToMint*2);

                        })
                    })

                });

                describe('when receiver is blacklisted', function () {
                    const to = blacklisted 

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                        assert.equal(await this.token.totalSupply(), amountToMint*2);

                    });
                });

                describe('when receiver is the zero address', function () {
                    const to = ZERO_ADDRESS

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                        assert.equal(await this.token.totalSupply(), amountToMint*2);
                    })
                })
            });
        });

        describe('approve', function  () {
            const amountToMint = 100 * 10 ** 18
            const amountToTransferFrom = 50 * 10 ** 18

            describe('token holder is not blacklisted', function () {

                const holder = whitelisted

                describe('spender is not blacklisted', function () {
                    const spender = nonlisted

                    it('increases senders allowance', async function () {
                        assert(await this.token.approve(spender, amountToTransferFrom, {from:holder}))
                        assert.equal(await this.token.allowance(holder, spender), amountToTransferFrom);
                    })

                    it('emits an Approval event', async function () {
                        const { logs } = await this.token.approve(spender, amountToTransferFrom, {from:holder})
                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, "Approval")
                        assert.equal(logs[0].args.owner, holder)
                        assert.equal(logs[0].args.spender, spender)
                        assert.equal(logs[0].args.value, amountToTransferFrom)
                    })
                })

                describe('spender is blacklisted', function () {
                    const spender = blacklisted

                    it('reverts', async function () {
                        await expectRevert(this.token.approve(spender, amountToTransferFrom, {from:holder}))
                        assert.equal(await this.token.allowance(holder, spender), 0);
                    })
                })
            })

            describe('token holder is blacklisted', function () {

                describe('spender is not blacklisted', function () {
                    const holder = blacklisted

                    it('reverts', async function () {
                        await expectRevert(this.token.approve(whitelisted, amountToTransferFrom, {from:holder}));
                    })
                })
            })
        })

        describe('approveBlacklistedAddressSpender', function () {
            
            const amountToMint = 100 * 10 ** 18
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
                assert.equal(await this.token.totalSupply(), amountToMint);
            })

            describe('message sender is a blacklist spender', function () {

                describe('token holder is blacklisted', function () {

                    it('allowance is set properly', async function () {

                        await this.token.approveBlacklistedAddressSpender(blacklisted, { from });
                        assert.equal(await this.token.allowance(blacklisted, from), amountToMint)

                    })
                    it('emits a ApprovedBlacklistedAddressSpender event', async function () {
                        const { logs } = await this.token.approveBlacklistedAddressSpender(blacklisted, { from });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'ApprovedBlacklistedAddressSpender');
                        assert.equal(logs[0].args.owner, blacklisted);
                        assert.equal(logs[0].args.spender, from);
                        assert.equal(logs[0].args.value, amountToMint);
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
            const amountToMint = 100 * 10 ** 18
            const amountToTransferFrom = 50 * 10 ** 18
            

            describe('token holder is not blacklisted', function () {

                const spender = nonlisted
                const to = user
                const from = whitelisted

                describe('function caller is approved to transferFrom token holder account', function () {
                    beforeEach(async function () {

                        // seed token holder account
                        await this.token.mint(from, amountToMint, {from:minter})

                        // approve spender to transfer from nonlisted and whitelisted accounts
                        await this.token.approve(spender, amountToTransferFrom, {from:whitelisted})

                        // nonlist receiver
                        await this.regulator.setNonlistedUser(to, {from:validator})

                    })

                    afterEach(async function () {
                        assert.equal(await this.token.totalSupply(), amountToMint);
                    })

                    describe('token holder has enough funds', function () {
                        it('transfer succeeds', async function () {
                            await this.token.transferFrom(from, to, amountToTransferFrom, { from: spender });

                            assertBalance(this.token, from, amountToMint-amountToTransferFrom);
                            assertBalance(this.token, to, amountToTransferFrom);
                        });
                        it('emits a Transfer event', async function () {
                            const { logs } = await this.token.transferFrom(from, to, amountToTransferFrom, { from: spender})
                            assert.equal(logs.length, 1)
                            assert.equal(logs[0].event, 'Transfer')
                            assert.equal(logs[0].args.from, from)
                            assert.equal(logs[0].args.to, to)
                            assert.equal(logs[0].args.value, amountToTransferFrom)
                        });
                    });

                    describe('spender does not have enough allowance', function () {
                       
                        it('reverts', async function () {
                            await expectRevert(this.token.transferFrom(from, to, amountToTransferFrom+1, { from: spender }));
                        });

                    });
                });

                describe('function caller is NOT approved to transferFrom token holder account', function () {
                    
                    beforeEach(async function () {

                        // seed token holder account
                        await this.token.mint(from, amountToMint, {from:minter})
                        
                        // nonlist receiver
                        await this.regulator.setNonlistedUser(to, {from:validator})
                    })

                    afterEach(async function () {
                        assert.equal(await this.token.totalSupply(), amountToMint);
                    })

                    it('reverts', async function () {
                        await expectRevert(this.token.transferFrom(from, to, amountToTransferFrom, {from: spender}));
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
                    assert.equal(await this.token.totalSupply(), amountToMint);
                })

                describe('function caller is approved to spend from a blacklisted account', function () {

                    it('transferFrom succeeds', async function () {
                        await this.token.approveBlacklistedAddressSpender(from, { from:blacklistedSpender });
                        await this.token.transferFrom( from, to, amountToTransferFrom, { from:blacklistedSpender } )
                        assertBalance(this.token, to, amountToTransferFrom)
                        assertBalance(this.token, from, amountToMint-amountToTransferFrom)
                    })

                })

                describe('function caller is NOT approved to spend from a blacklisted account', function () {

                    it('reverts', async function () {
                        await expectRevert(this.token.transferFrom( from, to, amountToTransferFrom, { from:blacklistedSpender } ));
                    })

                })

            });
        });

        describe('destroyBlacklistedTokens', function () {
            const amountToMint = 100 * 10 ** 18

            beforeEach(async function () {

                // seed blacklisted account
                await this.regulator.setWhitelistedUser(blacklisted, {from:validator})
                await this.token.mint(blacklisted, amountToMint, {from:minter})
                await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

                // give validator ability to destroy blacklisted tokens
                await this.regulator.setBlacklistDestroyer(validator, {from:validator})

                assert.equal(await this.token.balanceOf(blacklisted), amountToMint)
                assert.equal(await this.token.totalSupply(), amountToMint)

            })
            describe('function caller has permission to destroy blacklisted tokens', function () {

                const destroyer = validator

                describe('account is blacklisted', function () {
                    
                    const from = blacklisted

                    it('tokens are destroyed', async function () {

                        await this.token.destroyBlacklistedTokens(from, {from:destroyer})
                        assert.equal(await this.token.balanceOf(blacklisted), 0)
                        assert.equal(await this.token.totalSupply(), 0)
                    })

                    it('emits destroyed blacklisted tokens event', async function () {
                        const {logs} = await this.token.destroyBlacklistedTokens(from, { from: destroyer });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'DestroyedBlacklistedTokens');
                        assert.equal(logs[0].args.account, blacklisted);
                        assert.equal(logs[0].args.amount, amountToMint);
                    });
                })

                describe('account is not blacklisted', function () {

                    it('reverts', async function () {
                        await expectRevert(this.token.destroyBlacklistedTokens(whitelisted, {from:destroyer}))
                        await expectRevert(this.token.destroyBlacklistedTokens(nonlisted, {from:destroyer}))
                    })
                })
                
            });
            describe('function caller does not have permission to destroy blacklisted tokens', function () {
                const destroyer = nonlisted

                describe('account is blacklisted', function () {

                    const from = blacklisted

                    it('reverts', async function () {
                        await expectRevert(this.token.destroyBlacklistedTokens(from, {from:destroyer}))
                    })
                })

            });
        });

        describe('blacklisted', function () {
            const from = blacklisted

            describe('function caller is blacklisted', function () {
                it('returns true, trivially', async function () {
                    assert(await this.token.blacklisted({ from }));
                });
            });

            describe('function caller is not blacklisted', function () {
                it('reverts', async function () {
                    await expectRevert(this.token.blacklisted({ from: nonlisted }));
                    await expectRevert(this.token.blacklisted({ from: whitelisted }));
                });
            });
        });
    });
}

module.exports = {
    permissionedTokenBehavior
}