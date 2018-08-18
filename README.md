# fiat_gateway
Carbon's Crypto-Fiat gateway: smart contracts

Deployment Addresses in Rinkeby:

	Migrations: 0x0eeb954abc72c6689d5bf111c739acc67dad98c7

	RegulatorProxyFactory: 0x7b9b8c8dbc6aa1a5450f019dbfc5750e502286af

	CarbonDollarProxyFactory: 0x79b23bfc69a8419692b51482e19c3d39b95af5c4

	WhitelistedTokenProxyFactory: 0xf6d52de0dcbd5d7449665f7a84e1ae21564246cb

	WhitelistedTokenRegulator: 0x59010b4be37b5e8fa20db47a4f4234c0c1745c45

	CarbonDollarRegulator: 0x26254a2bafac0be509c5f28ce7e2a06f8c87f362

	CarbonDollar: 0x590554426afa84d3b83fd8b4afdb09c75667a5b2

	WhitelistedToken: 0xc53350de9c0e87be63742e3ba46897d7329a037b

	AddressVerification: 0xc8ca112adf948f8cec5abe987466917694c5fe56

To deploy, run:
truffle migrate --network *testnetwork here*

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
