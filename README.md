# fiat_gateway
Carbon's Crypto-Fiat gateway


Token Roles:

	Mint: account capable of minting or issuing new tokens to any account

	Whitelisted: account capable of redeeming tokens in exchange for withdrawing fiat

	Nonlisted: default account settings, capable of transferring tokens but cannot redeem

	Blacklisted: account unable to transfer or redeem, tokens are essentially frozen

Regulator Roles: 

	Validator: account capable of setting user permissions/roles including all the ones listed in this README

Special Roles:

	BlacklistedAddressSpender: can transfer tokens on behalf of a blacklisted token
	BlacklistedAddressDestroyer: can destroy tokens in a blacklisted account

Architecture

	CUSD is a MutablePermissionedToken and is the publicly exchange-traded token, and therefore it is the most liquid token
	
	WhitelistedToken is a PermissionedToken

	MutablePermissionedToken is a PermissionedToken capable of changing its Data Storage contracts

	PermissionedToken is a burnable, mintable, and pausable ERC-20 token that is connected at all times to a Regulator
		Data Storage:
			AllowanceSheet
			BalanceSheeet


	Regulator determines whether a user has permissions to call PermissionedToken functions
		Data Storage:
			ValidatorStorage
			PermissionStorage

