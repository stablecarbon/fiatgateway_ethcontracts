// Tests slightly modified from TrueUSD contracts.

const { assertBalance, expectRevert, ZERO_ADDRESS } = require('../../../helpers/common');

var BigNumber = require('bignumber.js');

function permissionedTokenBasicTests(owner, oneHundred, anotherAccount, minter) {
    describe("Behaves properly like a Pausable, Burnable, Mintable, Standard ERC20 token", function () {
        beforeEach(async function () {
            await this.token.mint(oneHundred, new BigNumber("100000000000000000000"), { from: minter });
        });
        
        describe('--BasicToken Tests--', function () {
            describe('total supply', function () {
                it('returns the total amount of tokens', async function () {
                    const totalSupply = await this.token.totalSupply()
                    assert(totalSupply.eq(new BigNumber("100000000000000000000")))
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
                        await assertBalance(this.token, oneHundred, new BigNumber("100000000000000000000"))
                    })
                })
            })
            
            describe('transfer', function () {
                describe('when the anotherAccount is not the zero address', function () {
                    const to = anotherAccount
                    
                    describe('when the sender does not have enough balance', function () {
                        const amount = new BigNumber("101000000000000000000")
                        
                        it('reverts', async function () {
                            await expectRevert(this.token.transfer(to, amount, { from: oneHundred }))
                        })
                    })
                    
                    describe('when the sender has enough balance', function () {
                        const amount = new BigNumber("100000000000000000000")
                        
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
            })
        })
        
        describe('--BurnableToken Tests--', function () {
            const from = oneHundred
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
            
            describe('when the given amount is not greater than balance of the sender', function () {
                const amount = new BigNumber("10000000000000000000")
                
                it('burns the requested amount', async function () {
                    await this.token.burn(amount, { from })
                    const balance = await this.token.balanceOf(from)
                    assert(balance.eq(new BigNumber("90000000000000000000")))
                    assert((await this.token.totalSupply()).eq(new BigNumber("90000000000000000000")))
                })
                
                it('emits a burn event', async function () {
                    const { logs } = await this.token.burn(amount, { from })
                    assert.equal(logs.length, 2)
                    assert.equal(logs[0].event, 'Burn')
                    assert.equal(logs[0].args.burner, oneHundred)
                    assert(logs[0].args.value.eq(amount))
                    
                    assert.equal(logs[1].event, 'Transfer')
                    assert.equal(logs[1].args.from, oneHundred)
                    assert.equal(logs[1].args.to, ZERO_ADDRESS)
                    assert(logs[1].args.value.eq(amount))
                })
            })
            
        })
        
        describe('-MintableToken Tests-', function () {
            const amount = new BigNumber("100000000000000000000")
            
            describe('when the sender is the token owner', function () {
                const from = owner
                
                it('mints the requested amount', async function () {
                    await this.token.mint(oneHundred, amount, { from:minter })
                    assertBalance(this.token, oneHundred, new BigNumber("200000000000000000000"))
                    assert((await this.token.totalSupply()).eq(new BigNumber("200000000000000000000")))
                })
                
                it('emits a mint and transfer event', async function () {
                    const { logs } = await this.token.mint(oneHundred, amount, { from:minter })
                    
                    assert.equal(logs.length, 2)
                    assert.equal(logs[0].event, 'Mint')
                    assert.equal(logs[0].args.to, oneHundred)
                    assert(logs[0].args.value.eq(amount))
                    assert.equal(logs[1].event, 'Transfer')
                    assert.equal(logs[1].args.from, ZERO_ADDRESS)
                    assert.equal(logs[1].args.to, oneHundred)
                    assert(logs[1].args.value.eq(amount))
                })
            })
            
            describe('when the sender is not the token owner', function () {
                const from = anotherAccount
                
                it('reverts', async function () {
                    await expectRevert(this.token.mint(anotherAccount, amount, { from:minter }))
                })
            })
        })
        
        describe('--StandardToken Tests--', function () {
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
            
            describe('approve', function () {
                describe('when the spender is not the zero address', function () {
                    const spender = anotherAccount
                    
                    describe('when the sender has enough balance', function () {
                        const amount = new BigNumber("100000000000000000000")
                        
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
                                assert(allowance.eq(amount))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, new BigNumber("1000000000000000000"), { from: oneHundred })
                            })
                            
                            it('approves the requested amount and replaces the previous one', async function () {
                                await this.token.approve(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(amount))
                            })
                        })
                    })
                    
                    describe('when the sender does not have enough balance', function () {
                        const amount = new BigNumber("101000000000000000000")
                        
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
                                assert(allowance.eq(amount))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, new BigNumber("1000000000000000000"), { from: oneHundred })
                            })
                            
                            it('approves the requested amount and replaces the previous one', async function () {
                                await this.token.approve(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(amount))
                            })
                        })
                    })
                })
                
                describe('when the spender is the zero address', function () {
                    const amount = new BigNumber("100000000000000000000")
                    const spender = ZERO_ADDRESS
                    
                    it('approves the requested amount', async function () {
                        await this.token.approve(spender, amount, { from: oneHundred })
                        
                        const allowance = await this.token.allowance(oneHundred, spender)
                        assert(allowance.eq(amount))
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
                            await this.token.approve(spender, new BigNumber("100000000000000000000"), { from: oneHundred })
                        })
                        
                        describe('when the oneHundred has enough balance', function () {
                            const amount = new BigNumber("100000000000000000000")
                            
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
                            const amount = new BigNumber("101000000000000000000")
                            
                            it('reverts', async function () {
                                await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                            })
                        })
                    })
                    
                    describe('when the spender does not have enough approved balance', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender,new BigNumber("99000000000000000000"), { from: oneHundred })
                        })
                        
                        describe('when the oneHundred has enough balance', function () {
                            const amount = new BigNumber("100000000000000000000")
                            
                            it('reverts', async function () {
                                await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                            })
                        })
                        
                        describe('when the oneHundred does not have enough balance', function () {
                            const amount = new BigNumber("100000000000000000000")
                            
                            it('reverts', async function () {
                                await expectRevert(this.token.transferFrom(oneHundred, to, amount, { from: spender }))
                            })
                        })
                    })
                })
                
                describe('when the anotherAccount is the zero address', function () {
                    const amount = new BigNumber("100000000000000000000")
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
                        const amount = new BigNumber("100000000000000000000")
                        
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
                                assert(allowance.eq(0))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, amount.plus(new BigNumber("1000000000000000000")), { from: oneHundred })
                            })
                            
                            it('decreases the spender allowance subtracting the requested amount', async function () {
                                await this.token.decreaseApproval(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(new BigNumber("1000000000000000000")))
                            })
                        })
                    })
                    
                    describe('when the sender does not have enough balance', function () {
                        const amount = new BigNumber("101000000000000000000")
                        
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
                                assert(allowance.eq(0))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, amount.plus(new BigNumber("1000000000000000000")), { from: oneHundred })
                            })
                            
                            it('decreases the spender allowance subtracting the requested amount', async function () {
                                await this.token.decreaseApproval(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(new BigNumber("1000000000000000000")))
                            })
                        })
                    })
                })
                
                describe('when the spender is the zero address', function () {
                    const amount = new BigNumber("100000000000000000000")
                    const spender = ZERO_ADDRESS
                    
                    it('decreases the requested amount', async function () {
                        await this.token.decreaseApproval(spender, amount, { from: oneHundred })
                        
                        const allowance = await this.token.allowance(oneHundred, spender)
                        assert(allowance.eq(0))
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
                const amount = new BigNumber("100000000000000000000")
                
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
                                assert(allowance.eq(amount))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, new BigNumber("1000000000000000000"), { from: oneHundred })
                            })
                            
                            it('increases the spender allowance adding the requested amount', async function () {
                                await this.token.increaseApproval(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(amount.plus(new BigNumber("1000000000000000000"))))
                            })
                        })
                    })
                    
                    describe('when the sender does not have enough balance', function () {
                        const amount = new BigNumber("101000000000000000000")
                        
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
                                assert(allowance.eq(amount))
                            })
                        })
                        
                        describe('when the spender had an approved amount', function () {
                            beforeEach(async function () {
                                await this.token.approve(spender, new BigNumber("1000000000000000000"), { from: oneHundred })
                            })
                            
                            it('increases the spender allowance adding the requested amount', async function () {
                                await this.token.increaseApproval(spender, amount, { from: oneHundred })
                                
                                const allowance = await this.token.allowance(oneHundred, spender)
                                assert(allowance.eq(amount.plus(new BigNumber("1000000000000000000"))))
                            })
                        })
                    })
                })
                
                describe('when the spender is the zero address', function () {
                    const spender = ZERO_ADDRESS
                    
                    it('approves the requested amount', async function () {
                        await this.token.increaseApproval(spender, amount, { from: oneHundred })
                        
                        const allowance = await this.token.allowance(oneHundred, spender)
                        assert(allowance.eq(amount))
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
        
        describe('--PausableToken Tests--', function () {
            
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
        })
    })
}

module.exports = {
    permissionedTokenBasicTests
}
