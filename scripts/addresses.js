// Tokens
const WTFactory = "0xf2227988698ebd5b5bd3f8506a402e8857c33a1b" // Whitelisted Token 
const CUSDFactory = "0x18f031b46f7ca203e1185738d3b6f897bd6e1673" // CUSD

// Regulators
const RegulatorFactory = "0xa592aa3d8db0fcf55889a2f7e7cc51c45e5a9852"

// Users
const mintRecipient = "0x15e5954046cDf3210A47CeCB789c6c286748aa91" // User who we want to mint to
const validator = "0xcf60b44605e265fe459ccc536fab71937a5cb13e" // Validator in charge of setting user permissions
const minterCUSD = "0xcf60b44605e265fe459ccc536fab71937a5cb13e" // Minter capable of calling mintCUSD()

module.exports = {
	WTFactory,
	CUSDFactory,
	RegulatorFactory,
	mintRecipient,
	validator,
	minterCUSD,
}