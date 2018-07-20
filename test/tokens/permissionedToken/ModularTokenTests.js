// Tests inspired by from TrueUSD contracts.

const {
    assertBalance,
    expectRevert,
    ZERO_ADDRESS,
    transfersToZeroBecomeBurns
} = require('../helpers/common');

function modularTokenTests([owner, oneHundred, anotherAccount]) {
    describe('--BasicToken Tests--', function () {
        describe('total supply', function () {
            it('returns the total amount of tokens', async function () {
                const totalSupply = await this.token.totalSupply()
                assert.equal(totalSupply, 100*10**18)
            })
        })

        describe('balanceOf', function () {
            describe('when the requested account has no tokens', function () {
                it('returns zero', async function () {
                    await assertBalance(this.token, owner, 0)
                })
            })

            describe('when the requested account has some tokens', function () {
                it('returns the total amount of tokens', async function () {
                    await assertBalance(this.token, oneHundred, 100*10**18)
                })
            })
        })

        describe('transfer', function () {
            describe('when the anotherAccount is not the zero address', function () {
                const to = anotherAccount

                describe('when the sender does not have enough balance', function () {
                    const amount = 101*10**18

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, amount, { from: oneHundred }))
                    })
                })

                describe('when the sender has enough balance', function () {
                    const amount = 100*10**18

                    it('transfers the requested amount', async function () {
                        await this.token.transfer(to, amount, { from: oneHundred })
                        await assertBalance(this.token, oneHundred, 0)
                        await assertBalance(this.token, to, amount)
                    })

                    it('emits a transfer event', async function () {
                        const { logs } = await this.token.transfer(to, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Transfer')
                        assert.equal(logs[0].args.from, oneHundred)
                        assert.equal(logs[0].args.to, to)
                        assert(logs[0].args.value.eq(amount))
                    })
                })
            })

            // This test is skipped for contracts that inherit from WithdrawalToken
            // because they treat such transfers as burns instead
            if (!transfersToZeroBecomeBurns) {
                describe('when the anotherAccount is the zero address', function () {
                    const to = ZERO_ADDRESS

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(to, 100*10**18, { from: oneHundred }))
                    })
                })
            }
        })
    })

    describe('--BurnableToken Tests--', function () {
        const from = oneHundred
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

        describe('when the given amount is not greater than balance of the sender', function () {
            const amount = 10 * 10 ** 18
            const burnNote = "burn coins"

            it('burns the requested amount', async function () {
                await this.token.burn(amount, burnNote, { from })

                const balance = await this.token.balanceOf(from)
                assert.equal(balance, 90 * 10 ** 18)
            })

            it('emits a burn event', async function () {
                const { logs } = await this.token.burn(amount, burnNote, { from })
                assert.equal(logs.length, 2)
                assert.equal(logs[0].event, 'Burn')
                assert.equal(logs[0].args.burner, oneHundred)
                assert.equal(logs[0].args.value, amount)
                assert.equal(logs[0].args.note, burnNote)

                assert.equal(logs[1].event, 'Transfer')
                assert.equal(logs[1].args.from, oneHundred)
                assert.equal(logs[1].args.to, ZERO_ADDRESS)
                assert.equal(logs[1].args.value, amount)
            })
        })

        describe('when the given amount is greater than the balance of the sender', function () {
            const amount = 101 * 10 ** 18
            const burnNote = "ill fail"
            it('reverts', async function () {
                await expectRevert(this.token.burn(amount, burnNote, { from }))
            })
        })



        if (transfersToZeroBecomeBurns) {
            describe('transfers to 0x0 become burns', function () {
                describe('when the given amount is not greater than balance of the sender', function () {
                    const amount = 10 * 10 ** 18

                    it('burns the requested amount', async function () {
                        await this.token.transfer(ZERO_ADDRESS, amount, { from })

                        const balance = await this.token.balanceOf(from)
                        assert.equal(balance, 90 * 10 ** 18)
                    })

                    it('emits a burn event', async function () {
                        const { logs } = await this.token.transfer(ZERO_ADDRESS, amount, { from })
                        assert.equal(logs.length, 2)
                        assert.equal(logs[0].event, 'Burn')
                        assert.equal(logs[0].args.burner, oneHundred)
                        assert.equal(logs[0].args.value, amount)

                        assert.equal(logs[1].event, 'Transfer')
                        assert.equal(logs[1].args.from, oneHundred)
                        assert.equal(logs[1].args.to, ZERO_ADDRESS)
                        assert.equal(logs[1].args.value, amount)
                    })
                })

                describe('when the given amount is greater than the balance of the sender', function () {
                    const amount = 101 * 10 ** 18

                    it('reverts', async function () {
                        await expectRevert(this.token.transfer(ZERO_ADDRESS, amount, { from }))
                    })
                })
            })
        }
    })

    describe('-MintableToken Tests-', function () {
        const amount = 100 * 10 ** 18

        describe('when the sender is the token owner', function () {
            const from = owner

            it('mints the requested amount', async function () {
                await this.token.mint(anotherAccount, amount, { from })

                const balance = await this.token.balanceOf(anotherAccount)
                assert.equal(balance, amount)
            })

            it('emits a mint finished event', async function () {
                const { logs } = await this.token.mint(anotherAccount, amount, { from })

                assert.equal(logs.length, 2)
                assert.equal(logs[0].event, 'Mint')
                assert.equal(logs[0].args.to, anotherAccount)
                assert.equal(logs[0].args.value, amount)
                assert.equal(logs[1].event, 'Transfer')
            })
        })

        describe('when the sender is not the token owner', function () {
            const from = anotherAccount

            it('reverts', async function () {
                await expectRevert(this.token.mint(anotherAccount, amount, { from }))
            })
        })
    })

    describe("-PausableToken Tests-", function () {
        describe('pause', function () {
            describe('when the sender is the token owner', function () {
                const from = owner

                describe('when the token is unpaused', function () {
                    it('pauses the token', async function () {
                        await this.token.pause({ from })

                        const paused = await this.token.paused()
                        assert.equal(paused, true)
                    })

                    it('emits a paused event', async function () {
                        const { logs } = await this.token.pause({ from })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Pause')
                    })
                })

                describe('when the token is paused', function () {
                    beforeEach(async function () {
                        await this.token.pause({ from })
                    })

                    it('reverts', async function () {
                        await expectRevert(this.token.pause({ from }))
                    })
                })
            })

            describe('when the sender is not the token owner', function () {
                const from = anotherAccount

                it('reverts', async function () {
                    await expectRevert(this.token.pause({ from }))
                })
            })
        })

        describe('unpause', function () {
            describe('when the sender is the token owner', function () {
                const from = owner

                describe('when the token is paused', function () {
                    beforeEach(async function () {
                        await this.token.pause({ from })
                    })

                    it('unpauses the token', async function () {
                        await this.token.unpause({ from })

                        const paused = await this.token.paused()
                        assert.equal(paused, false)
                    })

                    it('emits an unpaused event', async function () {
                        const { logs } = await this.token.unpause({ from })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Unpause')
                    })
                })

                describe('when the token is unpaused', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.unpause({ from }))
                    })
                })
            })

            describe('when the sender is not the token owner', function () {
                const from = anotherAccount

                it('reverts', async function () {
                    await expectRevert(this.token.unpause({ from }))
                })
            })
        })

        describe('pausable token', function () {
            const from = owner

            describe('paused', function () {
                it('is not paused by default', async function () {
                    const paused = await this.token.paused({ from })

                    assert.equal(paused, false)
                })

                it('is paused after being paused', async function () {
                    await this.token.pause({ from })
                    const paused = await this.token.paused({ from })

                    assert.equal(paused, true)
                })

                it('is not paused after being paused and then unpaused', async function () {
                    await this.token.pause({ from })
                    await this.token.unpause({ from })
                    const paused = await this.token.paused()

                    assert.equal(paused, false)
                })
            })

            describe('transfer', function () {
                it('allows to transfer when unpaused', async function () {
                    await this.token.transfer(recipient, 100 * 10 ** 18, { from: owner })
                    await assertBalance(this.token, owner, 0)
                    await assertBalance(this.token, recipient, 100 * 10 ** 18)
                })

                it('allows to transfer when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.transfer(recipient, 100 * 10 ** 18, { from: owner })
                    await assertBalance(this.token, owner, 0)
                    await assertBalance(this.token, recipient, 100 * 10 ** 18)
                })

                it('reverts when trying to transfer when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.transfer(recipient, 100 * 10 ** 18, { from: owner }))
                })
            })

            describe('approve', function () {
                it('allows to approve when unpaused', async function () {
                    await this.token.approve(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 40 * 10 ** 18)
                })

                it('allows to transfer when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.approve(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 40 * 10 ** 18)
                })

                it('reverts when trying to transfer when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.approve(anotherAccount, 40 * 10 ** 18, { from: owner }))
                })
            })

            describe('transfer from', function () {
                beforeEach(async function () {
                    await this.token.approve(anotherAccount, 50 * 10 ** 18, { from: owner })
                })

                it('allows to transfer from when unpaused', async function () {
                    await this.token.transferFrom(owner, recipient, 40 * 10 ** 18, { from: anotherAccount })

                    await assertBalance(this.token, owner, 60 * 10 ** 18)
                    await assertBalance(this.token, recipient, 40 * 10 ** 18)
                })

                it('allows to transfer when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.transferFrom(owner, recipient, 40 * 10 ** 18, { from: anotherAccount })
                    await assertBalance(this.token, owner, 60 * 10 ** 18)
                    await assertBalance(this.token, recipient, 40 * 10 ** 18)
                })

                it('reverts when trying to transfer from when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.transferFrom(owner, recipient, 40 * 10 ** 18, { from: anotherAccount }))
                })
            })

            describe('decrease approval', function () {
                beforeEach(async function () {
                    await this.token.approve(anotherAccount, 100 * 10 ** 18, { from: owner })
                })

                it('allows to decrease approval when unpaused', async function () {
                    await this.token.decreaseApproval(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 60 * 10 ** 18)
                })

                it('allows to decrease approval when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.decreaseApproval(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 60 * 10 ** 18)
                })

                it('reverts when trying to transfer when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.decreaseApproval(anotherAccount, 40, { from: owner }))
                })
            })

            describe('increase approval', function () {
                beforeEach(async function () {
                    await this.token.approve(anotherAccount, 100 * 10 ** 18, { from: owner })
                })

                it('allows to increase approval when unpaused', async function () {
                    await this.token.increaseApproval(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 140 * 10 ** 18)
                })

                it('allows to increase approval when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.increaseApproval(anotherAccount, 40 * 10 ** 18, { from: owner })

                    const allowance = await this.token.allowance(owner, anotherAccount)
                    assert.equal(allowance, 140 * 10 ** 18)
                })

                it('reverts when trying to increase approval when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.increaseApproval(anotherAccount, 40 * 10 ** 18, { from: owner }))
                })
            })

            describe('burn', function () {

                it('allows to burn when unpaused', async function () {
                    await this.token.burn(60 * 10 ** 18, "burnNote", { from: owner })
                    await assertBalance(this.token, owner, 40 * 10 ** 18)
                })

                it('allows to burn when paused and then unpaused', async function () {
                    await this.token.pause({ from: owner })
                    await this.token.unpause({ from: owner })

                    await this.token.burn(60 * 10 ** 18, "burnNote", { from: owner })
                    await assertBalance(this.token, owner, 40 * 10 ** 18)
                })

                it('reverts when trying to burn when paused', async function () {
                    await this.token.pause({ from: owner })

                    await expectRevert(this.token.burn(60 * 10 ** 18, "burnNote", { from: owner }))
                })
            })

            if (transfersToZeroBecomeBurns) {
                describe('transfers to 0x0 become burns', function () {
                    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
                    describe('burn', function () {
                        it('allows to burn when unpaused', async function () {
                            await this.token.transfer(ZERO_ADDRESS, 60 * 10 ** 18, { from: owner })
                            await assertBalance(this.token, owner, 40 * 10 ** 18)
                        })

                        it('allows to burn when paused and then unpaused', async function () {
                            await this.token.pause({ from: owner })
                            await this.token.unpause({ from: owner })

                            await this.token.transfer(ZERO_ADDRESS, 60 * 10 ** 18, { from: owner })
                            await assertBalance(this.token, owner, 40 * 10 ** 18)
                        })

                        it('reverts when trying to burn when paused', async function () {
                            await this.token.pause({ from: owner })

                            await expectRevert(this.token.transfer(ZERO_ADDRESS, 60 * 10 ** 18, { from: owner }))
                        })
                    })
                })
            }
        })
    });

    describe('--StandardToken Tests--', function () {
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

        describe('approve', function () {
            describe('when the spender is not the zero address', function () {
                const spender = anotherAccount

                describe('when the sender has enough balance', function () {
                    const amount = 100 * 10 ** 18

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.approve(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(amount))
                    })

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })
                })

                describe('when the sender does not have enough balance', function () {
                    const amount = 101 * 10 ** 18

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.approve(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(amount))
                    })

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })
                })
            })

            describe('when the spender is the zero address', function () {
                const amount = 100 * 10 ** 18
                const spender = ZERO_ADDRESS

                it('approves the requested amount', async function () {
                    await this.token.approve(spender, amount, { from: oneHundred })

                    const allowance = await this.token.allowance(oneHundred, spender)
                    assert.equal(allowance, amount)
                })

                it('emits an approval event', async function () {
                    const { logs } = await this.token.approve(spender, amount, { from: oneHundred })

                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, 'Approval')
                    assert.equal(logs[0].args.owner, oneHundred)
                    assert.equal(logs[0].args.spender, spender)
                    assert(logs[0].args.value.eq(amount))
                })
            })
        })

        describe('transfer from', function () {
            const spender = anotherAccount

            describe('when the anotherAccount is not the zero address', function () {
                const to = owner

                describe('when the spender has enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, 100 * 10 ** 18, { from: oneHundred })
                    })

                    describe('when the oneHundred has enough balance', function () {
                        const amount = 100 * 10 ** 18

                        it('transfers the requested amount', async function () {
                            await this.token.transferFrom(oneHundred, to, amount, { from: spender })
                            await assertBalance(this.token, oneHundred, 0)
                            await assertBalance(this.token, to, amount)
                        })

                        it('decreases the spender allowance', async function () {
                            await this.token.transferFrom(oneHundred, to, amount, { from: spender })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert(allowance.eq(0))
                        })

                        it('emits a transfer event', async function () {
                            const { logs } = await this.token.transferFrom(oneHundred, to, amount, { from: spender })

                            assert.equal(logs.length, 1)
                            assert.equal(logs[0].event, 'Transfer')
                            assert.equal(logs[0].args.from, oneHundred)
                            assert.equal(logs[0].args.to, to)
                            assert(logs[0].args.value.eq(amount))
                        })
                    })

                    describe('when the oneHundred does not have enough balance', function () {
                        const amount = 101 * 10 ** 18

                        it('reverts', async function () {
                            await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                        })
                    })
                })

                describe('when the spender does not have enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, 99 * 10 ** 18, { from: oneHundred })
                    })

                    describe('when the oneHundred has enough balance', function () {
                        const amount = 100 * 10 ** 18

                        it('reverts', async function () {
                            await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                        })
                    })

                    describe('when the oneHundred does not have enough balance', function () {
                        const amount = 101 * 10 ** 18

                        it('reverts', async function () {
                            await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                        })
                    })
                })
            })

            describe('when the anotherAccount is the zero address', function () {
                const amount = 100 * 10 ** 18
                const to = ZERO_ADDRESS

                beforeEach(async function () {
                    await this.token.approve(spender, amount, { from: oneHundred })
                })

                it('reverts', async function () {
                    await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                })
            })
        })

        describe('decrease approval', function () {
            describe('when the spender is not the zero address', function () {
                const spender = anotherAccount

                describe('when the sender has enough balance', function () {
                    const amount = 100 * 10 ** 18

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(0))
                    })

                    describe('when there was no approved amount before', function () {
                        it('keeps the allowance to zero', async function () {
                            await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, 0)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, amount + 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, 1 * 10 ** 18)
                        })
                    })
                })

                describe('when the sender does not have enough balance', function () {
                    const amount = 101 * 10 ** 18

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(0))
                    })

                    describe('when there was no approved amount before', function () {
                        it('keeps the allowance to zero', async function () {
                            await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, 0)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, amount + 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, 1 * 10 ** 18)
                        })
                    })
                })
            })

            describe('when the spender is the zero address', function () {
                const amount = 100 * 10 ** 18
                const spender = ZERO_ADDRESS

                it('decreases the requested amount', async function () {
                    await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                    const allowance = await this.token.allowance(oneHundred, spender)
                    assert.equal(allowance, 0)
                })

                it('emits an approval event', async function () {
                    const { logs } = await this.token.decreaseApproval(spender, amount, { from: oneHundred })

                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, 'Approval')
                    assert.equal(logs[0].args.owner, oneHundred)
                    assert.equal(logs[0].args.spender, spender)
                    assert(logs[0].args.value.eq(0))
                })
            })
        })

        describe('increase approval', function () {
            const amount = 100 * 10 ** 18

            describe('when the spender is not the zero address', function () {
                const spender = anotherAccount

                describe('when the sender has enough balance', function () {
                    it('emits an approval event', async function () {
                        const { logs } = await this.token.increaseApproval(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(amount))
                    })

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount + 1 * 10 ** 18)
                        })
                    })
                })

                describe('when the sender does not have enough balance', function () {
                    const amount = 101 * 10 ** 18

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.increaseApproval(spender, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Approval')
                        assert.equal(logs[0].args.owner, oneHundred)
                        assert.equal(logs[0].args.spender, spender)
                        assert(logs[0].args.value.eq(amount))
                    })

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount)
                        })
                    })

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, 1 * 10 ** 18, { from: oneHundred })
                        })

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseApproval(spender, amount, { from: oneHundred })

                            const allowance = await this.token.allowance(oneHundred, spender)
                            assert.equal(allowance, amount + 1 * 10 ** 18)
                        })
                    })
                })
            })

            describe('when the spender is the zero address', function () {
                const spender = ZERO_ADDRESS

                it('approves the requested amount', async function () {
                    await this.token.increaseApproval(spender, amount, { from: oneHundred })

                    const allowance = await this.token.allowance(oneHundred, spender)
                    assert.equal(allowance, amount)
                })

                it('emits an approval event', async function () {
                    const { logs } = await this.token.increaseApproval(spender, amount, { from: oneHundred })

                    assert.equal(logs.length, 1)
                    assert.equal(logs[0].event, 'Approval')
                    assert.equal(logs[0].args.owner, oneHundred)
                    assert.equal(logs[0].args.spender, spender)
                    assert(logs[0].args.value.eq(amount))
                })
            })
        })
    })
}

module.exports = {
    modularTokenTests
}
