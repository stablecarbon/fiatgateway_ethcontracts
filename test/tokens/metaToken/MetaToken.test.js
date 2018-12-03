const { MetaToken } = require('../../helpers/artifacts');
const { RegulatorMock } = require('../../helpers/mocks')
var BigNumber = require("bignumber.js");
const { getWeb3, getContractInstance } = require('../../helpers/getWeb3')
const { tokenSetupMetaToken } = require('../../helpers/tokenSetupMetaToken')
let _web3 = getWeb3() // @dev Use _web3 for web3@1.x version
const { CommonVariables, ZERO_ADDRESS, RANDOM_ADDRESS, expectRevert } = require('../../helpers/common');

contract('MetaToken', _accounts => {
    const commonVars = new CommonVariables(_accounts);
    const owner = commonVars.owner
    const minter = commonVars.user
    const validator = commonVars.validator
    const blacklisted = commonVars.attacker

    // MetaTransaction roles:
    // @dev signer: Signs the original meta-transaction
    const signer = commonVars.user2 
    // @dev relayer: Forwards the meta-transaction to MetaToken, pays for signer's gas fee
    const relayer = commonVars.user3 
    // @dev receiver: Recipient of original transfer
    const receiver = commonVars.validator2

    // Amount of CUSD to seed signer with
    // const amountToMintSigner = 150*10**18
    const amountToMintSigner = new BigNumber(150*10**18)
    
    beforeEach(async function () {

        await tokenSetupMetaToken.call(this, validator, minter, owner, blacklisted)
        
        // Use web3@1.X wrapped version of contracts
        this.token = getContractInstance("MetaToken", this.metatoken.address)
        this.wt0 = getContractInstance("WhitelistedToken", this.wtToken.address)

        // Mint signer new USD
        let receipt = await this.wt0.methods.mintCUSD(signer, amountToMintSigner).send({ from: minter, gas: 200000 })
        this.totalSupply_before = await this.token.methods.totalSupply().call()

        // Snapshot CUSD balances before
        this.balance_signer_before = await this.token.methods.balanceOf(signer).call()
        this.balance_relayer_before = await this.token.methods.balanceOf(relayer).call()
        this.balance_receiver_before = await this.token.methods.balanceOf(receiver).call()
        this.balance_token_before = await this.token.methods.balanceOf(this.token.options.address).call()
        this.total_supply_before = await this.token.methods.totalSupply().call()

        // Snapshot CUSD allowances before
        this.allowance_receiver_before = await this.token.methods.allowance(signer, receiver).call()

        // Snapshot ETH balances before
        this.eth_balance_signer_before = await _web3.eth.getBalance(signer)
        this.eth_balance_relayer_before = await _web3.eth.getBalance(relayer)
    })

    it('regulator is set up like a normal PermissionedToken', async function () {
        let meta_reg = await this.token.methods.regulator().call()
        assert.equal(meta_reg, _web3.utils.toChecksumAddress(this.regulator.address))
    })

    it('instantiated with a new token storage state', async function () {
        let total_supply = await this.token.methods.totalSupply().call()
        assert.equal(total_supply, amountToMintSigner)
    })

    describe('metaTransfer', async function () {
        const amountToTransfer = new BigNumber(100*10**18)
        let to = receiver
        let reward = new BigNumber(1*10**18)

        it('metaTransferHash returns same hash as web3.sign', async function () {
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
            // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            
            let contractCalculatedHash = await this.token.methods.metaTransferHash(to, amountToTransfer, nonce, reward).call()
            
            assert.equal(hash, contractCalculatedHash)
        })
        it('transfer goes through, signer pays CUSD to relayer who pays for their ETH gas fee', async function () {    
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
            // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)

            // User signs metatransaction with private key
            // @dev: wallet must be unlocked
            let sig = await _web3.eth.sign(hash, signer)
            // console.log('signature: ', sig)

            // Forward metatx to MetaTransaction proxy
            let receipt = await this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            // ).estimateGas({ from: relayer }).then(gas => { console.log (gas) })
            ).send({from: relayer, gas: 200000 })
            
            let events = receipt.events
            assert.equal(events.Transfer.length, 2)
                
            // Transfer from signer to receiver
            let eventParams_0 = events.Transfer[0].returnValues
            assert.equal(eventParams_0.from, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_0.to, _web3.utils.toChecksumAddress(receiver))
            assert.equal(eventParams_0.value, amountToTransfer)

            // Transfer from signer to relayer
            let eventParams_1 = events.Transfer[1].returnValues
            assert.equal(eventParams_1.from, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_1.to, _web3.utils.toChecksumAddress(relayer))
            assert.equal(eventParams_1.value, reward)

            // Snapshot CUSD balances after
            this.balance_signer_after = await this.token.methods.balanceOf(signer).call()
            assert.equal(this.balance_signer_after, this.balance_signer_before-amountToTransfer-reward)
            
            this.balance_relayer_after = await this.token.methods.balanceOf(relayer).call()
            assert.equal(this.balance_relayer_after, new BigNumber(this.balance_relayer_before+reward))

            this.balance_receiver_after = await this.token.methods.balanceOf(receiver).call()
            assert.equal(this.balance_receiver_after, new BigNumber(this.balance_receiver_before+amountToTransfer))

            this.total_supply_after = await this.token.methods.totalSupply().call()
            assert.equal(this.total_supply_before, this.total_supply_after)

            // Snapshot ETH balances before
            this.eth_balance_signer_after = await _web3.eth.getBalance(signer)
            assert.equal(this.eth_balance_signer_after, this.eth_balance_signer_before)

            this.eth_balance_relayer_after = await _web3.eth.getBalance(relayer)
            assert(this.eth_balance_relayer_after < this.eth_balance_relayer_before)
        })
        it('does not revert', async function () {
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 })
            assert(receipt)
        })
        it('receiver is blacklisted, reverts', async function () {    
            let to = blacklisted
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
        it('signer is blacklisted, reverts', async function () {    
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
        it('invalid metatransaction nonce, reverts', async function () {    
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            nonce += 1 // Attempt to hijack nonce to replay transactions
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
        it('signer does not have enough token balance, reverts', async function () {  
            let amountToTransfer = amountToMintSigner
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
        it('signer does not specify a reward, reverts', async function () {  
            let reward = new BigNumber(0)
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
        it('paused, reverts', async function () {  
            await this.token.methods.pause().send({ from: owner, gas: 200000 })
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaTransfer",   
                to,                           
                amountToTransfer,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaTransfer(
                to, 
                amountToTransfer, 
                sig,
                nonce,
                reward,
            ).send({ from: relayer, gas: 200000 }))
        })
    })
    describe('metaIncreaseApproval', async function () {
        const amountToApprove = new BigNumber(100*10**18)
        let spender = receiver
        let reward = new BigNumber(1*10**18)

        it('metaApproveHash returns same hash as web3.sign', async function () {
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
            // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            
            let contractCalculatedHash = await this.token.methods.metaApproveHash(spender, amountToApprove, nonce, reward).call()
            
            assert.equal(hash, contractCalculatedHash)
        })
        it('increaseApproval goes through, signer pays CUSD to relayer who pays for their ETH gas fee', async function () {    
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
            // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)

            // User signs metatransaction with private key
            // @dev: wallet must be unlocked
            let sig = await _web3.eth.sign(hash, signer)
            // console.log('signature: ', sig)

            // Forward metatx to MetaTransaction proxy
            let receipt = await this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            // ).estimateGas({ from: relayer }).then(gas => { console.log (gas) })
            ).send({from: relayer, gas: 200000 })
            
            let events = receipt.events
            assert.exists(events.Transfer)
            assert.exists(events.Approval)
                
            // Increase Approval from signer to receiver
            let eventParams_0 = events.Approval.returnValues
            assert.equal(eventParams_0.owner, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_0.spender, _web3.utils.toChecksumAddress(receiver))
            assert.equal(eventParams_0.value, amountToApprove)

            // Transfer from signer to relayer
            let eventParams_1 = events.Transfer.returnValues
            assert.equal(eventParams_1.from, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_1.to, _web3.utils.toChecksumAddress(relayer))
            assert.equal(eventParams_1.value, reward)

            // Snapshot CUSD balances after
            this.balance_signer_after = await this.token.methods.balanceOf(signer).call()
            assert.equal(this.balance_signer_after, this.balance_signer_before-reward)
            
            this.balance_relayer_after = await this.token.methods.balanceOf(relayer).call()
            assert.equal(this.balance_relayer_after, new BigNumber(this.balance_relayer_before+reward))

            // Snapshot CUSD allowances after
            this.allowance_receiver_after = await this.token.methods.allowance(signer, receiver).call()
            assert.equal(this.allowance_receiver_after, new BigNumber(this.allowance_receiver_before+amountToApprove))

            // Snapshot ETH balances before
            this.eth_balance_signer_after = await _web3.eth.getBalance(signer)
            assert.equal(this.eth_balance_signer_after, this.eth_balance_signer_before)

            this.eth_balance_relayer_after = await _web3.eth.getBalance(relayer)
            assert(this.eth_balance_relayer_after < this.eth_balance_relayer_before)
        })
        it('does not revert', async function () {
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 })
            assert(receipt)
        })
        it('spender is blacklisted, reverts', async function () {
            let spender = blacklisted    
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('signer is blacklisted, reverts', async function () {    
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('invalid metatransaction nonce, reverts', async function () {    
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            nonce += 1 // Hijack nonce here
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('signer does not have enough token balance, reverts', async function () {  
            let reward = amountToMintSigner + new BigNumber(1*10**18)
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('signer does not specify a reward, reverts', async function () {  
            let reward = new BigNumber(0)
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('paused, reverts', async function () {  
            await this.token.methods.pause().send({ from: owner, gas: 200000 })
            let data = this.token.methods.increaseApproval(spender, amountToApprove).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaIncreaseApproval",   
                spender,                           
                amountToApprove,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaIncreaseApproval(
                spender, 
                amountToApprove, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
    })
    describe('metaBurnCarbonDollar', async function () {
        const amountToBurn = new BigNumber(100*10**18)
        let fee = new BigNumber(0.001 * amountToBurn)
        let reward = new BigNumber(1*10**18)

        it('metaBurnHash returns same hash as web3.sign', async function () {
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
            // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            
            let contractCalculatedHash = await this.token.methods.metaBurnHash(stablecoin, amountToBurn, nonce, reward).call()
            
            assert.equal(hash, contractCalculatedHash)
        })
        it('burnCarbonDollar goes through, signer pays CUSD to relayer who pays for their ETH gas fee', async function () {    
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 })
            
            let events = receipt.events
            assert.exists(events.BurnedCUSD)
            assert.exists(events.Burn)
            assert.exists(events.Mint)
                
            // BurnCarbonDollar from signer
            let eventParams_0 = events.BurnedCUSD.returnValues
            assert.equal(eventParams_0.user, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_0.feedAmount, new BigNumber(amountToBurn - fee))
            assert.equal(eventParams_0.chargedFee, fee)

            // Burn from signer
            let eventParams_1 = events.Burn[0].returnValues
            assert.equal(eventParams_1.burner, _web3.utils.toChecksumAddress(signer))
            assert.equal(eventParams_1.value, amountToBurn)

            // Mint fee to token contract
            let eventParams_2 = events.Mint.returnValues
            assert.equal(eventParams_2.to, this.token.options.address)
            assert.equal(eventParams_2.value, fee)

            // Snapshot CUSD balances after
            this.balance_signer_after = await this.token.methods.balanceOf(signer).call()
            assert.equal(this.balance_signer_after, this.balance_signer_before-reward-amountToBurn)
            
            this.balance_token_after = await this.token.methods.balanceOf(this.token.options.address).call()
            assert.equal(this.balance_token_after, new BigNumber(this.balance_token_before+fee))

            // Snapshot total supply after
            this.total_supply_after = await this.token.methods.totalSupply().call()
            let expectedTotalSupply = (new BigNumber(this.total_supply_before) - (amountToBurn-fee))
            assert.equal(this.total_supply_after, expectedTotalSupply)

            // Snapshot ETH balances before
            this.eth_balance_signer_after = await _web3.eth.getBalance(signer)
            assert.equal(this.eth_balance_signer_after, this.eth_balance_signer_before)

            this.eth_balance_relayer_after = await _web3.eth.getBalance(relayer)
            assert(this.eth_balance_relayer_after < this.eth_balance_relayer_before)
        })
        it('does not revert', async function () {
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 })
            assert(receipt)
        })
        it('signer is blacklisted, reverts', async function () {
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, blacklisted)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('invalid metatransaction nonce, reverts', async function () {    
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            nonce += 1 // Hijack nonce here
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('signer does not have enough token balance, reverts', async function () { 
            let amountToBurn = amountToMintSigner 
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('signer does not specify a reward, reverts', async function () {  
            let reward = new BigNumber(0) 
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('CarbonDollar::burnCarbonDollar reverts', async function () {  
            let stablecoin = this.token.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
        it('paused, reverts', async function () { 
            await this.token.methods.pause().send({ from: owner }) 
            let stablecoin = this.wt0.options.address
            let data = this.token.methods.burnCarbonDollar(stablecoin, amountToBurn).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let metaTx = [
                metatoken,   
                "metaBurnCarbonDollar",   
                stablecoin,                           
                amountToBurn,        
                _web3.utils.toTwosComplement(nonce), 
                _web3.utils.toTwosComplement(reward), 
            ]

            let hash = _web3.utils.soliditySha3(...metaTx)
            let sig = await _web3.eth.sign(hash, signer)

            let receipt = await expectRevert(this.token.methods.metaBurnCarbonDollar(
                stablecoin, 
                amountToBurn, 
                sig,
                nonce,
                reward,
            ).send({from: relayer, gas: 200000 }))
        })
    })
})
