# fiat_gateway
Carbon's Crypto-Fiat gateway: smart contracts

[![node](https://img.shields.io/badge/Node-v8.11.4-brightgreen.svg)](https://github.com/stablecarbon/fiat_gateway)

Requires Node Version 8+

To deploy, run:
truffle migrate --network *testnetwork here*
The gas limit may have to be adjusted in truffle-config.js.
The current contracts deployed using 7000000 gas limit and cost ~2.5 ETH to deploy.

Token Roles:

	Mint: account capable of minting or issuing new tokens to any account

	MintCUSD: account that has all of the Mint access and can additionally mint directly from a WT into CUSD

	Whitelisted: account capable of redeeming tokens in exchange for withdrawing fiat
		CarbonDollar Whitelisted: account capable of converting CUSD into an underlying WT or redeeming for USD. This REPLACES the normal Whitelisted access.
		WhitelistedToken Whitelisted: account capable of converting WT into CUSD. This ADDS to the normal Whitelisted access, so WT users can not only convert their WT into CUSD but can also burn WT.

	Nonlisted: default account settings, capable of transferring tokens but cannot redeem
		CD Nonlisted: Cannot convert CUSD into WT or USD but can trade CUSD. This REPLACES the normal Nonlisted access.
		WT Nonlisted: Cannot convert WT but can trade WT. This ADDS to the normal Nonlisted access.

	Blacklisted: account unable to transfer or redeem, tokens are essentially frozen
		CD Blacklisted: Cannot convert CUSD into WT or USD or trade CUSD. This REPLACES the normal Blacklisted access.
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

Deployment Addresses:

Ropsten:

	RegulatorProxyFactory: 0x0eeb954abc72c6689d5bf111c739acc67dad98c7

	CarbonDollarProxyFactory: 0x0e9a127da064a1c5e31ccd08b2d83cebe626ef2b

	WhitelistedTokenProxyFactory: 0x7b9b8c8dbc6aa1a5450f019dbfc5750e502286af

	WhitelistedTokenRegulator: 0xf6d52de0dcbd5d7449665f7a84e1ae21564246cb

	CarbonDollarRegulator: 0x59010b4be37b5e8fa20db47a4f4234c0c1745c45

	CarbonDollar: 0x2345f809f39a52fc156b6edd400c0b14a0c11bc4

	WhitelistedToken: 0xc53350de9c0e87be63742e3ba46897d7329a037b

Mainnet (deployed with best results using 20 Gwei gas price):

	RegulatorProxyFactory (4mm gas): 0xd7f00820bd44a6c30888edff4495282028d58d36

	CarbonDollarProxyFactory (2mm gas):  0x64137b260a9ac9bb7609488dd8a9cf42723291cb

	WhitelistedTokenProxyFactory (1.5mm gas): 0xeaa47c38d2c7c946ae93fa9c09769a14e4ada74f

	WhitelistedTokenRegulator (4mm gas): 0x3d0c2ca9b014d7ef52d168c33e1d98d6b9eb1fe5

	CarbonDollarRegulator (4mm gas): 0xb5f440d0f5002e589755c07f26ad964eb3723175

	CarbonDollar (6mm gas): 0xd41851bcc58c0ea436f57957b1f0a3b27a1e7809

	WhitelistedToken (5mm gas): 0x7b811ae95fff15a3100cd39220af69faf523c2d9

