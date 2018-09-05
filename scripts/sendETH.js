
const { mintRecipient,
        validator } = require('./addresses')

let who = mintRecipient

module.exports = function(callback) {
    web3.eth.sendTransaction({ 
        from: validator,
        to: who,
        value: web3.toWei(1.0, "ether")
    }, function(err, hash) {
        if (!err) {
            console.log("Sent 1 ETH to " + who + ", txn hash: " + hash)
        }
        else {
            console.error(err)
        }
    })
}
