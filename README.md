# fiat_gateway
Carbon's Crypto-Fiat gateway: smart contracts

Deployment Addresses in Rinkeby:

	Migrations: 0x4e3e435face5ba42ba922f5078ac2a16965a79d8

	RegulatorProxyFactory: 0x37c018f026f86f52be8cefbc38cdaa7cba6abbfc

	CarbonDollarProxyFactory: 0xdbbd3f54da1c1dc7b7e797f06da03e5c1c864b26

	WhitelistedTokenProxyFactory: 0xb98f31cd7bc7cd431919a8abe2902e76e2e3cec9

	WhitelistedTokenRegulator: 0xf8b1eb7a7bca0b5f004148b89e0633d97161dbe6

	CarbonDollarRegulator: 0x070a4f7273a22e82410580d1e8da1f590da2f8d4

	CarbonDollar: 0x21641c9350517767ab2f6ba534e5638fc068dd3c

	WhitelistedToken: 0x7de8211dcbbb2f9f805033c0841554b3dad63f31

	AddressVerification: 0x01ff48f43c6a1dd7dc557369efae008b4b795662

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
