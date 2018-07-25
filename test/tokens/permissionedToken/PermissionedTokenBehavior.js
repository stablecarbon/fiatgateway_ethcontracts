const { assertBalance, expectRevert, depositFunds, ZERO_ADDRESS } = require("../../helpers/common");

// TODO add froms
function permissionedTokenBehavior(minter, whitelisted, nonlisted, blacklisted, user) {
    describe("Permissioned Token Tests", function () {
        describe('mint', function () {
            
            describe('when sender is minter', function () {
                from = minter

                describe('when user is whitelisted', function () {
                    
<<<<<<< HEAD
                    it('mints to user', async function () {
                        //await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
=======
                    it('mints to whitelisted', async function () {
                        // await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
                        // assertBalance(this.token, whitelisted, 0);
>>>>>>> pai_v0
                        assertBalance(this.token, whitelisted, 0);
                    });
                    
                    // it('correctly changes total supply', async function () {
                    //     await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
                    //     assert.equal(await this.token.totalSupply(), 100 * 10 ** 18);
                    // });
                    // it('emits mint and transfer events', async function () {
                    //     const { logs } = await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
                    //     assert.equal(logs.length, 2)
                    //     assert.equal(logs[0].event, 'Mint')
                    //     assert.equal(logs[0].args.to, whitelisted)
                    //     assert.equal(logs[0].args.value, 100 * 10 ** 18)
                    //     assert.equal(logs[1].event, 'Transfer')
                    //     assert.equal(logs[1].args.from, ZERO_ADDRESS)
                    //     assert.equal(logs[1].args.to, whitelisted)
                    //     assert.equal(logs[1].args.value, 100 * 10 ** 18)
                    // });
                });
                // describe('when user is not whitelisted', function () {
                //     describe('when user is nonlisted', function () {
                //         it('reverts call', async function () {
                //             await expectRevert(this.sheet.mint(nonlisted, 100 * 10 ** 18, { from }));
                //         });
                //     });
                //     describe('when user is blacklisted', function () {
                //         it('reverts call', async function () {
                //             await expectRevert(this.sheet.mint(blacklisted, 100 * 10 ** 18, { from }));
                //         });
                //     });
                // });
            });
            // describe('when sender is not minter', function () {
            //     from = nonlisted;
            //     it('reverts mint call', async function () {
            //         await expectRevert(this.sheet.mint(whitelisted, 100*10**18, { from }));
            //     });
            // });
        });
        // describe('burn', function () {
        //     describe('when sender is whitelisted', function () {
        //         from = whitelisted
        //         it('mints to user', async function () {
        //             await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
        //             await this.token.burn(50 * 10 ** 18, { from: whitelisted })
        //             assertBalance(this.token, whitelisted, 50 * 10 ** 18);
        //         });
        //         it('correctly changes total supply', async function () {
        //             await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
        //             await this.token.burn(50 * 10 ** 18, { from: whitelisted })
        //             assert.equal(await this.token.totalSupply(), 50 * 10 ** 18);
        //         });
        //         it('emits burn and transfer events', async function () {
        //             await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter })
        //             const { logs } = await this.token.burn(50 * 10 ** 18, { from: minter })
        //             assert.equal(logs.length, 2)
        //             assert.equal(logs[0].event, 'Burn')
        //             assert.equal(logs[0].args.to, whitelisted)
        //             assert.equal(logs[0].args.value, 50 * 10 ** 18)
        //             assert.equal(logs[1].event, 'Transfer')
        //             assert.equal(logs[1].args.from, whitelisted)
        //             assert.equal(logs[1].args.to, ZERO_ADDRESS)
        //             assert.equal(logs[1].args.value, 50 * 10 ** 18)
        //         });
        //     });
        //     describe('when sender is not whitelisted', function () {
        //         it('reverts call', async function () {
        //             user = blacklisted
        //             await this.token.mint(user, 100 * 10 ** 18, { from: minter })
        //             await expectRevert(this.token.burn(50 * 10 ** 18, { from: user }));
        //         });
        //         it('reverts call', async function () {
        //             user = nonlisted
        //             await this.token.mint(user, 100 * 10 ** 18, { from: minter })
        //             await expectRevert(this.token.burn(50 * 10 ** 18, { from: user }));
        //         });
        //     });
        // });
        // describe('transfer', function () {
        //     describe('sender is blacklisted', function () {
        //         from = blacklisted
        //         user = nonlisted
        //         it('reverts call', async function () {
        //             depositFunds(this.token, blacklisted, 50 * 10 ** 18, true);
        //             await expectRevert(this.token.transfer(nonlisted, 50 * 10 ** 18, { from: blacklisted }));
        //         });
        //     });
        //     describe('sender is nonlisted or whitelisted', function () {
        //         describe('transfer can work between any two non-blacklisted parties when funds are plenty', function () {
        //             from = nonlisted
        //             to = whitelisted
        //             it('transfer works', async function () {
        //                 depositFunds(this.token, nonlisted, 100 * 10 ** 18, false);
        //                 await this.token.mint(whitelisted, 100 * 10 ** 18, { from: minter });

        //                 await this.token.transfer(whitelisted, 50 * 10 ** 18, { from: nonlisted })
        //                 assertBalance(this.token, nonlisted, 50 * 10 ** 18);
        //                 assertBalance(this.token, whitelisted, 150 * 10 ** 18);

        //                 await this.token.transfer(nonlisted, 25 * 10 ** 18, { from: whitelisted })
        //                 assertBalance(this.token, nonlisted, 75 * 10 ** 18);
        //                 assertBalance(this.token, whitelisted, 125 * 10 ** 18);
        //             });
        //             it('emits transfer event', async function () {
        //                 depositFunds(this.token, nonlisted, 100 * 10 ** 18, false);

        //                 const { logs } = await this.token.transfer(whitelisted, 50 * 10 ** 18, { from: nonlisted })
        //                 assert.equal(logs.length, 1)
        //                 assert.equal(logs[0].event, 'Transfer')
        //                 assert.equal(logs[0].args.from, whitelisted)
        //                 assert.equal(logs[0].args.to, ZERO_ADDRESS)
        //                 assert.equal(logs[0].args.value, 50 * 10 ** 18)
        //             });
        //         });
        //         describe('when recipient is not blacklisted but funds are not available', function () {
        //             it('transfer is reverted', async function () {
        //                 depositFunds(this.token, nonlisted, 50 * 10 ** 18, false);
        //                 await this.token.mint(whitelisted, 50 * 10 ** 18, { from: minter });

        //                 await expectRevert(this.token.transfer(whitelisted, 100 * 10 ** 18, { from: nonlisted }))
        //                 await expectRevert(this.token.transfer(nonlisted, 100 * 10 ** 18, { from: whitelisted }))
        //             });
        //         });
        //         describe('when recipient is blacklisted', function () {
        //             it('transfer reverts', async function () {
        //                 depositFunds(this.token, nonlisted, 50 * 10 ** 18, false);
        //                 await expectRevert(this.token.transfer(blacklisted, 25 * 10 ** 18, { from: nonlisted }))
        //                 await expectRevert(this.token.transfer(blacklisted, 25 * 10 ** 18, { from: whitelisted }))
        //             });
        //         });
        //     });
        // });
        // describe('transferFrom', function () {
        //     describe('sender and recipient are not blacklisted', function () {
        //         describe('transfer initiator is approved', function () {
        //             describe('funds are plenty', function () {
        //                 it('transfer succeeds', async function () {
        //                     await this.token.mint(whitelisted, 50 * 10**18, {from:minter});
        //                     await this.token.approve(whitelisted, minter, 25 * 10 ** 18);
        //                     await this.token.transferFrom(whitelisted, nonlisted, 20 * 10 ** 18, { from: minter });
        //                     assertBalance(this.token, whitelisted, 30 * 10**18);
        //                     assertBalance(this.token, nonlisted, 20 * 10**18);
        //                 });
        //                 it('emits transfer event', async function () {
        //                     await this.token.mint(whitelisted, 50 * 10 ** 18, { from: minter });
        //                     await this.token.approve(whitelisted, minter, 25 * 10 ** 18);
        //                     const { logs } = await this.token.transferFrom(whitelisted, nonlisted, 20 * 10 ** 18, { from: minter })
        //                     assert.equal(logs.length, 1)
        //                     assert.equal(logs[0].event, 'Transfer')
        //                     assert.equal(logs[0].args.from, whitelisted)
        //                     assert.equal(logs[0].args.to, ZERO_ADDRESS)
        //                     assert.equal(logs[0].args.value, 50 * 10 ** 18)
        //                 });
        //             });
        //             describe('funds are not plenty', function () {
        //                 it('transfer reverts', async function () {
        //                     await this.token.mint(whitelisted, 50 * 10 ** 18, { from: minter });
        //                     await expectRevert(this.token.transferFrom(whitelisted, minter, 25 * 10 ** 18, { from: nonlisted }));
        //                 });
        //             });
        //         });
        //         describe('transfer initiator is not approved', function () {
        //             it('transfer reverts', async function () {
        //                 await this.token.mint(whitelisted, 50 * 10 ** 18, { from: minter });
        //                 await expectRevert(this.token.transferFrom(whitelisted, minter, 25 * 10**18, {from: nonlisted}));
        //             });
        //         });
        //     });
        //     describe('sender is blacklisted', function () {
        //         describe('transfer initiator is approved', function () {
        //             describe('transfer initiator is an approved BLACKLIST ACCOUNT spender', function () {
        //                 it('transfer succeeds', async function () {
        //                     depositFunds(this.token, blacklisted, 50 * 10 ** 18, false);
        //                     this.token.approveBlacklistedAccountSpender(blacklisted, {from: validator});
                            
        //                     await this.token.transferFrom(blacklisted, nonlisted, 25 * 10 ** 18, { from: validator });
        //                     assertBalance(this.token, nonlisted, 25*10**18);
        //                 });
        //             });
        //             describe('transfer initiator is NOT an approved BLACKLIST ACCOUNT spender', function () {
        //                 it('transfer reverts', async function () {
        //                     await expectRevert(this.token.transferFrom(blacklisted, nonlisted, 25 * 10 ** 18, { from: validator }));
        //                 });
        //             });
        //         });
        //         describe('transfer initiator is not approved', function () {
        //             it('transfer reverts', async function () {
        //                 depositFunds(this.token, blacklisted, 50 * 10 ** 18, false);
        //                 await expectRevert(this.token.transferFrom(blacklisted, minter, 25 * 10 ** 18, { from: nonlisted }));
        //             });
        //         });
        //     });
        // });
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