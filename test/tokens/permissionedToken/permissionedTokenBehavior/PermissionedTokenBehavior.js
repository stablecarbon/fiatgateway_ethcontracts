const { assertBalance, expectRevert, ZERO_ADDRESS } = require("../../../helpers/common");
var BigNumber = require("bignumber.js");

function permissionedTokenBehaviorTests(minter, whitelisted, blacklisted, nonlisted, user, validator, owner) {
    describe("PermissionedToken behavior abides by regulator", function () {
        
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
                    it('reverts when paused', async function () {
                        await this.token.pause({ from: owner })
                        await expectRevert(this.token.mint(to, amountToMint, {from}))
                    })
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

                it('burns user funds when paused and then unpaused', async function () {
                    await this.token.pause({from:owner})
                    await this.token.unpause({from:owner})
                    await this.token.burn(amountToBurn, { from })
                    assertBalance(this.token, from, amountToMint.minus(amountToBurn));
                })

                describe('when the amount is more than the users balance', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.burn(amountToMint.plus(1), { from }));
                        assertBalance(this.token, from, amountToMint);
                    });
                })

                describe('when paused', function () {
                    const from = whitelisted
                    it('reverts', async function () {
                        await this.token.pause( { from:owner } )
                        await expectRevert( this.token.burn( amountToBurn, { from } ) )
                    })
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
                        })

                        it('transfer succeeds from whitelisted to nonlisted', async function () {
                            await this.token.transfer(from, amountToTransfer, { from:to });
                            assertBalance(this.token, to, amountToMint.minus(amountToTransfer));
                            assertBalance(this.token, from, amountToMint.plus(amountToTransfer));
                        })
                        it('transfer succeeds when paused and then unpaused', async function () {
                            await this.token.pause( { from:owner })
                            await this.token.unpause( { from:owner })
                            await this.token.transfer(to, amountToTransfer, { from });
                            assertBalance(this.token, from, amountToMint.minus(amountToTransfer));
                            assertBalance(this.token, to, amountToMint.plus(amountToTransfer));
                        })
                    })

                    describe('when paused', function () {

                        it('reverts', async function () {
                            await this.token.pause( { from:owner })
                            await expectRevert(this.token.transfer(from, amountToTransfer, { from }))
                        })
                    })

                });

                describe('when receiver is blacklisted', function () {
                    const to = blacklisted 

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                    });
                });

                describe('when receiver is the zero address', function () {
                    const to = ZERO_ADDRESS

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: nonlisted }))
                        await expectRevert(this.token.transfer(to, amountToTransfer, { from: whitelisted }))
                    })
                })
            });
        });

        describe('approve', function  () {
            const amountToTransferFrom = new BigNumber("100000000000000000000") //100e18
            describe('token holder is not blacklisted', function () {

                const holder = whitelisted

                describe('spender is not blacklisted', function () {
                    const spender = nonlisted

                    it('locked by default', async function () { 
                        await expectRevert(this.token.approve(spender, amountToTransferFrom, {from:holder}))
                    })

                    describe('unlocked approve method', function () {
                        beforeEach(async function () {
                            await this.token.unlock({ from: owner })
                        })

                        it('increases senders allowance', async function () {
                            assert(await this.token.approve(spender, amountToTransferFrom, {from:holder}))
                            assert((await this.token.allowance(holder, spender)).eq(amountToTransferFrom));
                        })

                        it('approves when paused and then paused', async function () {
                            await this.token.pause( { from:owner })
                            await this.token.unpause( { from:owner })
                            assert(await this.token.approve(spender, amountToTransferFrom, {from:holder}))
                            assert((await this.token.allowance(holder, spender)).eq(amountToTransferFrom));
                        })

                        describe('tries to approve when paused', function () {
                            it('reverts', async function () {
                                await this.token.pause( { from:owner })
                                await expectRevert(this.token.approve(spender, amountToTransferFrom, {from:holder}))
                            })
                        })
                        describe('spender is blacklisted', function () {
                            it('reverts', async function () {
                                await expectRevert(this.token.approve(blacklisted, amountToTransferFrom, {from:holder}))
                                assert((await this.token.allowance(holder, spender)).eq(0));
                            })
                        })
                        describe('token holder is blacklisted', function () {
                            describe('spender is not blacklisted', function () {
                                it('reverts', async function () {
                                    await expectRevert(this.token.approve(whitelisted, amountToTransferFrom, {from:blacklisted}));
                                })
                            })
                        })
                    })
                })
            })
        })

        describe('increaseApproval', function () {
            const amountToTransferFrom = new BigNumber("100000000000000000000") //100e18
            describe('token holder is not blacklisted', function () {
                const holder = whitelisted
                describe('spender is not blacklisted', function () {
                    const spender = nonlisted
                    it('increases senders allowance', async function () {
                        assert(await this.token.increaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(amountToTransferFrom));
                    })
                    it('approves when paused and then paused', async function () {
                        await this.token.pause( { from:owner })
                        await this.token.unpause( { from:owner })
                        assert(await this.token.increaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(amountToTransferFrom));
                    })
                    describe('when paused', function () {
                        it('reverts', async function () {
                            await this.token.pause( { from:owner })
                            await expectRevert(this.token.increaseApproval(spender, amountToTransferFrom, {from:holder}))
                        })
                    })
                })

                describe('spender is blacklisted', function () {
                    const spender = blacklisted
                    it('reverts', async function () {
                        await expectRevert(this.token.increaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(0));
                    })
                })
            })

            describe('token holder is blacklisted', function () {
                const holder = blacklisted
                it('reverts', async function () {
                    await expectRevert(this.token.increaseApproval(whitelisted, amountToTransferFrom, {from:holder}));
                })
            })
        })

        describe('decreaseApproval', function () {
            const amountToTransferFrom = new BigNumber("100000000000000000000") //100e18

            describe('token holder is not blacklisted', function () {
                const holder = whitelisted

                describe('spender is not blacklisted', function () {
                    const spender = nonlisted

                    beforeEach(async function () {
                        await this.token.increaseApproval(spender, amountToTransferFrom, {from:holder})
                    })

                    it('decreases senders allowance', async function () {
                        assert(await this.token.decreaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(0));
                    })

                    it('approves when paused and then paused', async function () {
                        await this.token.pause( { from:owner })
                        await this.token.unpause( { from:owner })
                        assert(await this.token.decreaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(0));
                    })

                    describe('when paused', function () {
                        it('reverts', async function () {
                            await this.token.pause( { from:owner })
                            await expectRevert(this.token.decreaseApproval(spender, amountToTransferFrom, {from:holder}))
                        })
                    })
                })

                describe('spender is blacklisted', function () {
                    const spender = blacklisted
                    it('reverts', async function () {
                        await expectRevert(this.token.decreaseApproval(spender, amountToTransferFrom, {from:holder}))
                        assert((await this.token.allowance(holder, spender)).eq(0));
                    })
                })
            })

            describe('token holder is blacklisted', function () {
                const holder = blacklisted
                it('reverts', async function () {
                    await expectRevert(this.token.decreaseApproval(whitelisted, amountToTransferFrom, {from:holder}));
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
                    it('sets allowance when paused and then unpaused', async function () {
                        await this.token.pause( { from:owner } )
                        await this.token.unpause( { from:owner })
                        await this.token.approveBlacklistedAddressSpender(blacklisted, { from });
                        assert((await this.token.allowance(blacklisted, from)).eq(amountToMint));
                    })
                    describe('when paused', function () {
                        it('reverts', async function () {
                            await this.token.pause( { from:owner })
                            await expectRevert(this.token.approveBlacklistedAddressSpender(blacklisted, { from }))
                        })
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

            describe('token holder is not blacklisted', function () {

                const spender = nonlisted
                const to = user
                const from = whitelisted

                describe('spender is approved to transferFrom token holder account', function () {
                    beforeEach(async function () {
                        // seed token holder account
                        await this.token.mint(from, amountToMint, {from:minter})
                        // approve spender to transfer from nonlisted and whitelisted accounts
                        await this.token.increaseApproval(spender, amountToTransferFrom, {from:whitelisted})
                        // nonlist receiver
                        await this.regulator.setNonlistedUser(to, {from:validator})
                    })

                    describe('token holder has enough funds', function () {

                        describe('recipient is not blacklisted', function () {
                            it('transfer succeeds', async function () {
                                await this.token.transferFrom(from, to, amountToTransferFrom, { from: spender });
                                assertBalance(this.token, from, amountToMint.minus(amountToTransferFrom));
                                assertBalance(this.token, to, amountToTransferFrom);
                            });
     
                            it('transfer succeeds when paused and then unpaused', async function () {
                                await this.token.pause({ from:owner })
                                await this.token.unpause({ from:owner })
                                await this.token.transferFrom(from, to, amountToTransferFrom, { from: spender });
                                assertBalance(this.token, from, amountToMint.minus(amountToTransferFrom));
                                assertBalance(this.token, to, amountToTransferFrom);
                            })

                            describe('when paused', function () {
                                it('reverts', async function () {
                                    await this.token.pause({ from:owner })
                                    await expectRevert(this.token.transferFrom(from, to, amountToTransferFrom, { from:spender }))
                                })
                            })
                        })

                        describe('recipient is blacklisted', function () {
                            it('reverts', async function () {
                                const to = blacklisted
                                await expectRevert(this.token.transferFrom(from, to, amountToTransferFrom, {from:spender}))
                            })
                        })
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
                        assert((await this.token.totalSupply()).eq(amountToMint));
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

        describe('destroyBlacklistedTokens', function () {
            const amountToMint = 100 * 10 ** 18

            beforeEach(async function () {
                // seed blacklisted account
                await this.regulator.setWhitelistedUser(blacklisted, {from:validator})
                await this.token.mint(blacklisted, amountToMint, {from:minter})
                await this.regulator.setBlacklistedUser(blacklisted, {from:validator})
                // give validator ability to destroy blacklisted tokens
                await this.regulator.setBlacklistDestroyer(validator, {from:validator})
            })
            describe('function caller has permission to destroy blacklisted tokens', function () {
                const destroyer = validator
                describe('account is blacklisted', function () {
                    const from = blacklisted
                    it('tokens are destroyed', async function () {
                        await this.token.destroyBlacklistedTokens(from, 50 * 10 ** 18, {from:destroyer})
                        assert((await this.token.balanceOf(blacklisted)).eq(50 * 10 ** 18))
                        assert((await this.token.totalSupply()).eq(50 * 10 ** 18))
                    })

                    it('emits destroyed blacklisted tokens event', async function () {
                        const {logs} = await this.token.destroyBlacklistedTokens(from,50 * 10 ** 18, { from: destroyer });
                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'DestroyedBlacklistedTokens');
                        assert.equal(logs[0].args.account, blacklisted);
                        assert(logs[0].args.amount.eq(50 * 10 ** 18));
                    });

                    it('tokens are destroyed when paused and then unpaused', async function () {
                        await this.token.pause({ from:owner })
                        await this.token.unpause({ from:owner })
                        await this.token.destroyBlacklistedTokens(from,50 * 10 ** 18, { from:destroyer })
                        assert((await this.token.balanceOf(blacklisted)).eq(50 * 10 ** 18))
                        assert((await this.token.totalSupply()).eq(50 * 10 ** 18))
                    })
                    describe('when paused', function () {
                        it('reverts', async function () {
                            await this.token.pause({ from:owner })
                            await expectRevert(this.token.destroyBlacklistedTokens(from, 50 * 10 ** 18, { from:destroyer }))
                        })
                    })
                })

                describe('account is not blacklisted', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.destroyBlacklistedTokens(whitelisted, 50 * 10 ** 18,{from:destroyer}))
                        await expectRevert(this.token.destroyBlacklistedTokens(nonlisted, 50 * 10 ** 18,{from:destroyer}))
                    })
                })
                
            });
            describe('function caller does not have permission to destroy blacklisted tokens', function () {
                const destroyer = nonlisted

                describe('account is blacklisted', function () {
                    const from = blacklisted
                    it('reverts', async function () {
                        await expectRevert(this.token.destroyBlacklistedTokens(from, 50 * 10 ** 18,{from:destroyer}))
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
    permissionedTokenBehaviorTests
}