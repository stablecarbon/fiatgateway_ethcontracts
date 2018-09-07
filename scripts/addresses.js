// Users
const mintRecipient = "0x7E6CE384E67505709b0a072aeE5B3C6735fe962D" // User who we want to mint to
const validator = "0x70b979bd4a1bab88a200dd4cca6c0bfff42e582f" // Validator in charge of setting user permissions
const minterCUSD = validator // Minter capable of calling mintCUSD()

module.exports = {
	mintRecipient,
	validator,
	minterCUSD,
}