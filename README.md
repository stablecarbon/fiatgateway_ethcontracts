# fiat_gateway
Carbon's CUSD-Fiat gateway: smart contracts

[![node](https://img.shields.io/badge/Node-v8.11.4-brightgreen.svg)](https://github.com/stablecarbon/fiat_gateway)

Requires Node Version 8+

## Deployment
To deploy, run:
`truffle migrate --network [network]`
The gas limit may have to be adjusted in `truffle-config.js`.
The current contracts deployed using 7000000 gas limit and cost ~2.5 ETH to deploy.

## ETH node
truffle-config currently connects to Ethereum via Infura using the account stored in a .env mnemonic at the i'th index: 

`provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY_MAIN, i)
      },`

# Architecture
## Token Roles:

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

## Regulator Roles:

	Validator: account capable of setting user permissions/roles including all the ones listed in this README. Regulator owner is able to set validators.

## Special Roles:

	BlacklistedAddressSpender: can transfer tokens on behalf of a blacklisted token
	BlacklistedAddressDestroyer: can destroy tokens in a blacklisted account

## Architecture Description

	CUSD is a MutableStorage PermissionedToken and is the publicly exchange-traded token, and therefore it is the most liquid token
		Data Storage:
			FeeSheet
			StablecoinWhitelist

	WhitelistedToken is a PermissionedToken

	Two-way convertability between: CUSD < -- > WT. Account must be whitelisted by relevant CD AND WT regulator to convert (via burnCUSD/convertCUSD (CUSD --> WT [--> fiat]) or mintCUSD/convertWT ([fiat -->] WT --> CUSD).

	PermissionedToken is a burnable, mintable, and pausable ERC-20 token that is connected at all times to a Regulator
		Data Storage:
			AllowanceSheet
			BalanceSheeet


	Regulator determines whether a user has permissions to call PermissionedToken functions
		Data Storage:
			ValidatorStorage
			PermissionStorage

	Proxies: Proxies are upgradeable by owner of the contract. The Proxy allows owner to modify its implementation logic only. Data storage is set once upon construction. The latest implementation function call is fetched by the proxy and called in the context of the Proxy. Importantly, the Proxy must have identical data storage to its implementation.
		CarbonDollarProxy <-- use this to interact with CD
		PermissionedTokenProxy <--use this to interact with PT
		RegulatorProxy <--use this to interact with Regulator

# Deployment Addresses:

## Mainnet (Logic contracts are proxy "implementations", *Active contracts are used*):

[RegulatorProxyFactory](https://etherscan.io/address/0xf363c6de4a27c202fd8e3216351c242fb4a39d8c)

[CarbonDollarProxyFactory](https://etherscan.io/address/0x4a5693fa90442aff3067b59a4256834fe612b541)

[WhitelistedTokenProxyFactory](https://etherscan.io/address/0x3aa4a0482e6f475856d98c12e71b658d0c1d0b68)

[WhitelistedTokenRegulator (logic)](https://etherscan.io/address/0x0eb1b93c35dc7513c1e6cd683850734686fc9106)
[WhitelistedTokenRegulator (active)](https://etherscan.io/address/0x8644b70d1e40e954d8397e79a210624cbc22e1fe)

[CarbonDollarRegulator (logic)](https://etherscan.io/address/0x78a87623e381c395f6b02c649893642dcb3d245e)
[CarbonDollarRegulator (active)](https://etherscan.io/address/0xbe729d06dd2d7b2e953b40e234c62bd5f0204a12)

[CarbonDollar (logic)](https://etherscan.io/address/0xe05b1e8463773a2368760bfff14c2bb20821d990)
[CarbonDollar (active)](https://etherscan.io/address/0x1410d4ec3d276c0ebbf16ccbe88a4383ae734ed0)

[WhitelistedToken (logic)](https://etherscan.io/address/0xe5b58d53caabc455a4ea1ad6a9ea48bca0e42c7a)
[WhitelistedToken (active)](https://etherscan.io/address/0x21683397aa53aaf7baca416c27f2c1e0e84bb493)
