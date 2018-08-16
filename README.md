# fiat_gateway
Carbon's Crypto-Fiat gateway: smart contracts

Deployment Addresses in Rinkeby:
Migrations: 0x2cd608ea7c9b8f0d87586c6763640c24e3930ff0
RegulatorProxyFactory: 0x50025ae42b7fb8fdf691bf619786007e43cb81d6
CarbonDollarProxyFactory: 0x11d31c460b0c913055d72dcc5fc67c13552e79c9
WhitelistedTokenProxyFactory: 0x1b66363d6b32765b66fb278eb772438f6d5fdff7
WhitelistedTokenRegulator: 0xc97c9226322ed5f6b32becf8a4ec0dc7f622f7d3
CarbonDollarRegulator: 0x3941e490bef14bb531b97701d491e59d7ec04247
CarbonDollar: 0xaf9023e111c466c986cce1470dbc18a6a24eb105
WhitelistedToken: 0x35ef0a417914160d38cf256c0fc0259959fc538c
AddressVerification: 0x33fa5931b1848127064865d0062a038edc9d01d5

To deploy, run:
truffle migrate --network *testnetwork here*

Token Roles:

	Mint: account capable of minting or issuing new tokens to any account

	MintCUSD: account that has all of the Mint access and can additionally mint directly from a WT into CUSD

	Whitelisted: account capable of redeeming tokens in exchange for withdrawing fiat
		CarbonDollar Whitelisted: account capable of converting CUSD into an underlying WT. This REPLACES the normal Whitelisted access. Observe that CUSD users can only convert their CUSD into WT; they cannot burn CUSD.
		WhitelistedToken Whitelisted: account capable of converting WT into CUSD. This ADDS to the normal Whitelisted access, so WT users can not only convert their WT into CUSD but can also burn WT.

	Nonlisted: default account settings, capable of transferring tokens but cannot redeem
		CD Nonlisted: Cannot convert CUSD into WT but can trade CUSD. This REPLACES the normal Nonlisted access.
		WT Nonlisted: Cannot convert WT but can trade WT. This ADDS to the normal Nonlisted access.

	Blacklisted: account unable to transfer or redeem, tokens are essentially frozen
		CD Blacklisted: Cannot convert CUSD or trade CUSD. This REPLACES the normal Blacklisted access.
		WT Blacklisted: Cannot convert WT or trade WT. This ADDS to the normal Blacklisted access.

Regulator Roles:

	Validator: account capable of setting user permissions/roles including all the ones listed in this README. Regulator owner is able to set validators.

Special Roles:

	BlacklistedAddressSpender: can transfer tokens on behalf of a blacklisted token
	BlacklistedAddressDestroyer: can destroy tokens in a blacklisted account

Architecture

	CUSD is a MutableStorage PermissionedToken and is the publicly exchange-traded token, and therefore it is the most liquid token
		Data Storage:
			FeeSheet
			StablecoinWhitelist

	WhitelistedToken is a PermissionedToken

	Two-way convertability between: CUSD < -- > WT. Account must be whitelisted by relevant CD or WT regulator.

	PermissionedToken is a burnable, mintable, and pausable ERC-20 token that is connected at all times to a Regulator
		Data Storage:
			AllowanceSheet
			BalanceSheeet


	Regulator determines whether a user has permissions to call PermissionedToken functions
		Data Storage:
			ValidatorStorage
			PermissionStorage

	Proxies: Proxies are upgradeable by owner of the contract. The Proxy allows owner to modify its (1) data storage and (2) implementation logic. The latest implementation function call is fetched by the proxy and called in the context of the Proxy. THEREFORE, the Proxy must have identical data storage to its implementation.
		CarbonDollarProxy <-- use this to interact with CD
		PermissionedTokenProxy <--use this to interact with PT
		RegulatorProxy <--use this to interact with Regulator
