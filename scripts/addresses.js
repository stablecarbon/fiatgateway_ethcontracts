// Tokens
const WTFactory = "0xd6eb1c3a5eee5872ff1bd02ea4daed4d7b70707c" // Whitelisted Token 
const CUSDFactory = "0x1fd174556558b940852345507e9f5fc678acea11" // CUSD

// Regulators
const RegulatorFactory = "0xf4dbda16b9706802e437393221b0e12ac37ac9c0"

// Users
const mintRecipient = "0x15e5954046cDf3210A47CeCB789c6c286748aa91" // User who we want to mint to
const validator = "0xc22ef12053187baa89e2709bbf4f8dcb08bd2307" // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()

module.exports = {
	WTFactory,
	CUSDFactory,
	RegulatorFactory,
	mintRecipient,
	validator,
	minterCUSD,
}