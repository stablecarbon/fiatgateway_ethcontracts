const { MetaToken } = require('../../helpers/artifacts');
const { RegulatorMock } = require('../../helpers/mocks')
var BigNumber = require("bignumber.js");
const { getWeb3, getContractInstance } = require('../../helpers/getWeb3')
let _web3 = getWeb3() // @dev Use _web3 for web3@1.x version
const { CommonVariables, ZERO_ADDRESS, expectRevert } = require('../../helpers/common');

contract('PermissionedToken', _accounts => {
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
    
    beforeEach(async function () {

        this.regulator = await RegulatorMock.new({from:validator})

        // Set user permissions
        await this.regulator.setMinter(minter, {from:validator})
        await this.regulator.setBlacklistedUser(blacklisted, {from:validator})

        let new_token = await MetaToken.new(this.regulator.address, {from:owner})
        // Use web3@1.X wrapped version of contracts
        this.token = getContractInstance("MetaToken", new_token.address)
    })

    it('regulator is set up like a normal PermissionedToken', async function () {
        let meta_reg = await this.token.methods.regulator().call()
        assert.equal(meta_reg, _web3.utils.toChecksumAddress(this.regulator.address))
    })

    it('instantiated with a new token storage state', async function () {
        let total_supply = await this.token.methods.totalSupply().call()
        assert.equal(total_supply, 0)
    })

    describe('metaTransfer', function () {
        const amountToTransfer = 100*10**18
        let to = receiver
        it('metaTransferHash returns same hash as web3.sign', async function () {
            let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
            let nonce = await this.token.methods.replayNonce(signer).call()
            let metatoken = this.token.options.address
            let reward = 1*10**18

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
        // it('transfer goes through, signer does not pay any ETH', async function () {
        //     let data = this.token.methods.transfer(to, amountToTransfer).encodeABI()
        //     let nonce = await this.token.methods.replayNonce(signer).call()
        //     let metatoken = this.token.options.address
        //     let reward = 1*10**18

        //     // Hash must be in this format: keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
        //     // @devs: cast all signed ints to unsigned ints via web3.utils.toTwosComplement()
        //     let metaTx = [
        //         metatoken,   
        //         "metaTransfer",   
        //         to,                           
        //         amountToTransfer,        
        //         _web3.utils.toTwosComplement(nonce), 
        //         _web3.utils.toTwosComplement(reward), 
        //     ]
    
        //     let hash = _web3.utils.soliditySha3(...metaTx)
    
        //     // User signs metatransaction with private key
        //     // @dev: wallet must be unlocked
        //     let sig = await _web3.eth.sign(hash, signer)
        //     console.log('metatx hash: ', hash)
        //     console.log('signature: ', sig)

        //     // // 2. Forward metatx to GasBoy proxy
        //     // let result = await GasBoy.methods.forward(
        //     //     sig, 
        //     //     signer, 
        //     //     destination,
        //     //     "0",
        //     //     data,
        //     //     rewardAddress,
        //     //     rewardAmount
        //     // // ).estimateGas({ from: relayer }).then(gas => { console.log (gas) })
        //     // ).send({from: relayer, gas: 100000 })
        //     // .on('receipt', function(receipt) {
        //     //     // console.log('forwarded tx hash: ', receipt.transactionHash)
        //     //     let events = receipt.events
        //     //     assert.isNotEmpty(events.Forwarded)
        //     //     assert.equal(events.Forwarded.transactionHash, receipt.transactionHash)
        //     //     let eventParams = events.Forwarded.returnValues
        //     //     assert.equal(eventParams.sig, sig)
        //     //     assert.equal(eventParams.signer, web3.utils.toChecksumAddress(signer))
        //     //     assert.equal(eventParams.destination, web3.utils.toChecksumAddress(destination))
        //     //     assert.equal(eventParams.value, "0")
        //     //     assert.equal(eventParams.data, data)
        //     //     assert.equal(eventParams.rewardToken, web3.utils.toChecksumAddress(rewardAddress))
        //     //     assert.equal(eventParams.rewardAmount, rewardAmount)
        //     //     assert.equal(eventParams._hash, hash)
        //     // })
        //     // .on('error', console.error)

        //     // // Check if Example contract increased its counter
        //     // let counter = await Example.methods.count().call()
        //     // // console.log('counter: ',counter)
        //     // assert.equal(counter, 84)

        // })
    })
})
