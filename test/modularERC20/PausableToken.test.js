const {
    expectRevert,
    assertBalance,
    CommonVariables,
    PausableTokenMock,
    transfersToZeroBecomeBurns
} = require('../helpers/common');

contract('PausableToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.tokenOwner;
    const anotherAccount = commonVars.userSender;
    const recipient = commonVars.userReceiver;

    beforeEach(async function () {
        this.token = await PausableTokenMock.new(owner, 100*10**18, { from: owner })
    })

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
                await this.token.transfer(recipient, 100*10**18, { from: owner })
                await assertBalance(this.token, owner, 0)
                await assertBalance(this.token, recipient, 100*10**18)
            })

            it('allows to transfer when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.transfer(recipient, 100*10**18, { from: owner })
                await assertBalance(this.token, owner, 0)
                await assertBalance(this.token, recipient, 100*10**18)
            })

            it('reverts when trying to transfer when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.transfer(recipient, 100*10**18, { from: owner }))
            })
        })

        describe('approve', function () {
            it('allows to approve when unpaused', async function () {
                await this.token.approve(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 40*10**18)
            })

            it('allows to transfer when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.approve(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 40*10**18)
            })

            it('reverts when trying to transfer when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.approve(anotherAccount, 40*10**18, { from: owner }))
            })
        })

        describe('transfer from', function () {
            beforeEach(async function () {
                await this.token.approve(anotherAccount, 50*10**18, { from: owner })
            })

            it('allows to transfer from when unpaused', async function () {
                await this.token.transferFrom(owner, recipient, 40*10**18, { from: anotherAccount })

                await assertBalance(this.token, owner, 60*10**18)
                await assertBalance(this.token, recipient, 40*10**18)
            })

            it('allows to transfer when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.transferFrom(owner, recipient, 40*10**18, { from: anotherAccount })
                await assertBalance(this.token, owner, 60*10**18)
                await assertBalance(this.token, recipient, 40*10**18)
            })

            it('reverts when trying to transfer from when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.transferFrom(owner, recipient, 40*10**18, { from: anotherAccount }))
            })
        })

        describe('decrease approval', function () {
            beforeEach(async function () {
                await this.token.approve(anotherAccount, 100*10**18, { from: owner })
            })

            it('allows to decrease approval when unpaused', async function () {
                await this.token.decreaseApproval(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 60*10**18)
            })

            it('allows to decrease approval when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.decreaseApproval(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 60*10**18)
            })

            it('reverts when trying to transfer when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.decreaseApproval(anotherAccount, 40, { from: owner }))
            })
        })

        describe('increase approval', function () {
            beforeEach(async function () {
                await this.token.approve(anotherAccount, 100*10**18, { from: owner })
            })

            it('allows to increase approval when unpaused', async function () {
                await this.token.increaseApproval(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 140*10**18)
            })

            it('allows to increase approval when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.increaseApproval(anotherAccount, 40*10**18, { from: owner })

                const allowance = await this.token.allowance(owner, anotherAccount)
                assert.equal(allowance, 140*10**18)
            })

            it('reverts when trying to increase approval when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.increaseApproval(anotherAccount, 40*10**18, { from: owner }))
            })
        })

        describe('burn', function () {

            it('allows to burn when unpaused', async function () {
                await this.token.burn(60*10**18, "burnNote", { from: owner })
                await assertBalance(this.token, owner, 40*10**18)
            })

            it('allows to burn when paused and then unpaused', async function () {
                await this.token.pause({ from: owner })
                await this.token.unpause({ from: owner })

                await this.token.burn(60*10**18, "burnNote", { from: owner })
                await assertBalance(this.token, owner, 40*10**18)
            })

            it('reverts when trying to burn when paused', async function () {
                await this.token.pause({ from: owner })

                await expectRevert(this.token.burn(60*10**18,  "burnNote",{ from: owner }))
            })
        })

        if (transfersToZeroBecomeBurns) {
            describe('transfers to 0x0 become burns', function () {
                const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
                describe('burn', function () {
                    it('allows to burn when unpaused', async function () {
                        await this.token.transfer(ZERO_ADDRESS, 60*10**18, { from: owner })
                        await assertBalance(this.token, owner, 40*10**18)
                    })

                    it('allows to burn when paused and then unpaused', async function () {
                        await this.token.pause({ from: owner })
                        await this.token.unpause({ from: owner })

                        await this.token.transfer(ZERO_ADDRESS, 60*10**18, { from: owner })
                        await assertBalance(this.token, owner, 40*10**18)
                    })

                    it('reverts when trying to burn when paused', async function () {
                        await this.token.pause({ from: owner })

                        await expectRevert(this.token.transfer(ZERO_ADDRESS, 60*10**18, { from: owner }))
                    })
                })
            })
        }
    })
})