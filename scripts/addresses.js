// Users
const mintRecipient = "0xfe6eb9835041e16a67eeeecdb7945af27bc5a28d" // User who we want to mint to
const owner = "0xb3801a04f1fc50b71d5c0776b0739add3aaddc42"
const validator = "0xfe6eb9835041e16a67eeeecdb7945af27bc5a28d" // Validator in charge of setting user permissions
const minterCUSD = owner // Minter capable of calling mintCUSD()
const cusd = "0xa12df85972d7b567553ce81d78cfc9c5b1d3455a"

// In case of transferring ownership:
const newOwner = ""

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
	newOwner,
	owner,
	cusd
}