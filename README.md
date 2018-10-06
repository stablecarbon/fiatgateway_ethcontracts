# fiat_gateway
Carbon's CUSD-Fiat gateway: smart contracts

[![node](https://img.shields.io/badge/Node-v8.11.4-brightgreen.svg)](https://github.com/stablecarbon/fiat_gateway)

## Deployment
To deploy, run:
`truffle migrate --network [network]`
The gas limit may have to be adjusted in `truffle-config.js`.

[Sep 18] The latest deployment cost ~2.5 ETH to deploy.

## Contract Verification 
Code dependencies need to be flattened into a single `*.sol` contract in order for popular block explorers like etherscan.io to verify their byteccode. 

Run `sol-merger ./contracts/[CONTRACT].sol "./flatten/*.sol"` to flatten any contract into the flatten/ directory named [CONTRACT]\_merged.sol

## Connecting to an Ethereum node
truffle-config currently connects to Ethereum via an [Infura account](https://infura.io/) using the account [mnemonic](https://en.bitcoin.it/wiki/Seed_phrase) stored in a .env 

`provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY_MAIN, i)
      },`

## MetaMask!: This application runs best with the MetaMask browser extension
Any browser-based wallet should work with this app, but if there is one we missed then we are happy to add it!

Why MetaMask: a MetaMask password is less worrisome than a private key to lose track of. It's a wrapper over multiple wallets, but can expose private keys. MetaMask is also a lot more convenient for users who do want to deal with the complexities of other web-based wallets like MyEtherwallet.

What you need to keep secret:
	A) password: Your metamask is unique to your computer on local computer
	B) seedwords --> can restore metamask account including ETH keypairs on any computer.

## Architecture
### Core Token:
	CUSD: "CUSD" is a regulated ERC20 token redeemable into any whitelisted token, the initial of which is "WT0" (Whitelisted Token v.0)

### Our Regulators can assign accounts Permissions
### Token Permissions:

	MintPermissions: account capable of minting or issuing new CUSD or WT0 tokens to any account

	Whitelisted: whitelisted accounts can(1) receive newly minted tokens and (2) redeem tokens with our partner banks


### Regulator Permissions:

	Validator: account capable of setting user permissions/roles including MintPermissions and Whitelisted

### Architecture Description

	CUSD is a Permissioned ERC20 Token whose methods are protected by a Regulator

	WhitelistedToken is also a PermissionedToken and is two-convertible into CUSD`

## Deployment Addresses:

### Mainnet (Logic contracts are proxy "implementations", *Only the Active contracts can be used*):

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

### Setting up CUSD token for local
1) The Regulator/CarbonDollar/Whitelisted Proxy Factories can create new CUSD, WT0, and Regulator contracts. 

`RegulatorProxyFactory.createRegulatorProxy(Regulator.address)` creates a new Regulator instance that uses the same logic as the abstract Regulator Logic contract. For example, `RegulatorProxyFactory.createRegulatorProxy(CarbonDollarRegulatorInstance.address)` would act as a Regulator that can regulate the CUSD token. Importantly, since Regulators are ownable contracts, the Factory will transfer ownership to the specified owner account in `./scripts/addresses.js` and must be claimed via `newRegulator.claimOwnership({ from: newOwner })`.

For convenience, the caller of createRegulatorProxy() is designated a Validator for that Regulator. This can be changed by the Regulator owner.

*[Sept18] Carbon created two Regulators initially, a CarbonDollarRegulator and a WhitelistedTokenRegualtor, respectively in the 0th and the 1st index position in Regulator.getRegulator(i)*

2) Newly created contracts are initialized with empty data storages. A newly created token contract must be assigned a chosen regulated upon creation. `CarbonDollarProxyFactory` and `WhitelistedTokenProxyFactory` work similarly to the Regulator factory. They create new tokens via `CarbonDollarProxyFactory.createToken(CUSD.address, CUSDRegulator.address)` and `WhitelistedTOkenProxyFactory.createToken(WT.address, CUSD.address, WTRegulator.address)` where CUSD, WT and CUSD/WTRegulators are abstract logic contracts. CUSD is the CarbonDollar that a given WT is fungible with. Again, ownerships of token contracts must be claimed.

3) Now, we have to do some additional setup steps to ensure that CUSD and WT work properly.
	
i) CarbonDollarRegulator and WhitelistedTokenRegulator instances must whitelist the CUSD active address to enforce fungibility between CUSD and WT

	`WTRegulator.whitelist(CUSD.address, {from: validator})`
	`CUSDRegulator.whitelist(CUSD.address, {from: validator})`

ii) CUSD must whitelist WT as an official stablecoin that CUSD is redeemable for

	`CUSD.listToken(WT.address, {from:cusdOwner})`

iii) To mint new tokens, both the CarbonDollarRegulator and WhitelistedTokenRegulator must designate a minter capable of calling `mint()`

	`Regulator.setMinter(minter, {from: validator})`

iv) To set a fee charged upon redeeming CUSD into WT, the CUSD contract owner may call `CUSD.setFee(fee)` on the active CUSD contract. Fees can optionally be collected be escrowed by the CUSD contract to pay for transaction fees.

v) An address must be whitelisted by both CUSD and WT0 regulators to receive newly minted CUSD and whitelisted by WT0 to receive WT0

Model scripts are provided in `./scripts/` for convenient contract interactions that can be run with `truffle exc ./scripts/[script] --network [network]`

### Ropsten

[RegulatorProxyFactory](https://ropsten.etherscan.io/address/0x2d35b31f1b760e22b6f926abaca365f97b261b2e)

[CarbonDollarProxyFactory](https://ropsten.etherscan.io/address/0xa7c6ade3951b5bac577f69eb514da005dd26d05c)

[WhitelistedTokenProxyFactory](https://ropsten.etherscan.io/address/0xba6dac4d0367e0a4f854296d117cad0e6d7a97b3)

[WhitelistedTokenRegulator (logic)](https://ropsten.etherscan.io/address/0x64db6b6f3a9b3c0d2f6fcea14a18976cebfc9e66)

[WhitelistedTokenRegulator (active)](https://ropsten.etherscan.io/address/0xd0ead2198a14f1766f6aa0c9e3e14959da50b265)

[CarbonDollarRegulator (logic)](https://ropsten.etherscan.io/address/0x56a3e755a1df17884a87a328080d0b4f77fb7fa9)

[CarbonDollarRegulator (active)](https://ropsten.etherscan.io/address/0xe8bfa3ab2449a049522866b8f4f000fef3ac26d5)

[CarbonDollar (logic)](https://ropsten.etherscan.io/address/0x11027eda599d638bdabe26ec503f0a9301eee127)

[CarbonDollar (active)](https://ropsten.etherscan.io/address/0x67450c8908e2701abfa6745be3949ad32acf42d8)

[WhitelistedToken (logic)](https://ropsten.etherscan.io/address/0x99f72bd9aebbd1e51ba977157d5f0eca73dadd8f)

[WhitelistedToken (active)](https://ropsten.etherscan.io/address/0xcd36463470c4b92700b4d5fbe270e680d9d48968)
