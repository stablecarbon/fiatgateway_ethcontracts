// Tokens
const WTFactory = "0xc086c9b98111197d5c6193b59736702719558ccd" // Whitelisted Token 
const CUSDFactory = "0xf604daa5d1f215449e461699b5029255ba5407be" // CUSD

// Regulators
const RegulatorFactory = "0x976de07227b3c1857ee315dd5a57b7c6a984ad0a"

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