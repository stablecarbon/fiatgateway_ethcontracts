// Users
const mintRecipient = "" // User who we want to mint to
const owner = "0xb3801a04f1fc50b71d5c0776b0739add3aaddc42"
const validator = "0xfe6eb9835041e16a67eeeecdb7945af27bc5a28d" // Validator in charge of setting user permissions
const minterCUSD = "0xfe6eb9835041e16a67eeeecdb7945af27bc5a28d" // Minter capable of calling mintCUSD()
const cusdAddress = "0x1410d4ec3d276c0ebbf16ccbe88a4383ae734ed0"

// In case of transferring ownership:
const oldOwner = ""
const newOwner = ""

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
	newOwner,
	oldOwner,
	owner,
	cusdAddress
}