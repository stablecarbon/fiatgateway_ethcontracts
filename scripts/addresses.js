// Tokens
const WTFactory = "0x8102446ec16675c31bd10be513d4e89ab34b083f" // Whitelisted Token 
const CUSDFactory = "0xf1ed96787b56089990a7cd6719abc4129083ec17" // CUSD

// Regulators
const RegulatorFactory = "0x9f11573265d178cf97d5d0b445a78bd544d02f2c"

// Users
const mintRecipient = "0x15e5954046cDf3210A47CeCB789c6c286748aa91" // User who we want to mint to
const validator = "0x21c55917dee15cc90a0c01f779430349a8ad08ff" // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()

module.exports = {
	WTFactory,
	CUSDFactory,
	RegulatorFactory,
	mintRecipient,
	validator,
	minterCUSD,
}