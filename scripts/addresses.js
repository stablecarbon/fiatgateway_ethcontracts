// Users
const mintRecipient = "0x15e5954046cDf3210A47CeCB789c6c286748aa91" // User who we want to mint to
const validator = "0x7f9a59167e52a3fe45e5b7f6ba583b84be04f4f9" // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
}