# fiat_gateway
Carbon's Crypto-Fiat gateway: smart contracts

[![node](https://img.shields.io/badge/Node-v8.11.4-brightgreen.svg)](https://github.com/stablecarbon/fiat_gateway)

Requires Node Version 8+

Deployment Addresses in Rinkeby:

	Migrations: 0x12c30c603ce1be272167d23be431f5abdf5abb0d

	RegulatorProxyFactory: 0x37ad0f117780fdf7dfb63e86097cf9d6082e41cb

	CarbonDollarProxyFactory: 0x29c0e4b4e800dc329f52d0bc24f1c4f59b2431ca

	WhitelistedTokenProxyFactory: 0x26a73cda632d642b90e1b78d848ef57f11fa2752

	WhitelistedTokenRegulator: 0xff34b9f96403f07bbedb343ce8ffe1fc847941de

	CarbonDollarRegulator: 0x9e1a226ce7a83090a489207d0b3acf312d4b8dac

	CarbonDollar: 0x45fc9ce32c8d3404ee146718124b9ced4b04baac

	WhitelistedToken: 0xb40ce0833fac645815710e14c872179539917ab0

	AddressVerification: 0x05d9e09c82bd184326be74d3dff11241ceb967ff

To deploy, run:
truffle migrate --network *testnetwork here*
The gas limit may have to be adjusted in truffle-config.js.
The current contracts deployed using 7000000 gas. 

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
