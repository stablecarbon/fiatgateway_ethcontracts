// Users
const mintRecipient = "0x7e6ce384e67505709b0a072aee5b3c6735fe962d" // User who we want to mint to
const validator = mintRecipient // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()
const CUSDContract = "0xa2a175d23348a748fd35957934b67f47796da301"

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
	CUSDContract,
}