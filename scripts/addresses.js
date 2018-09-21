// Users
const mintRecipient = "0xb3801a04f1fc50b71d5c0776b0739add3aaddc42" // User who we want to mint to
const validator = mintRecipient // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()

// In case of transferring ownership:
const newOwner = "0xb3801a04f1fc50b71d5c0776b0739add3aaddc42"

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
	newOwner
}