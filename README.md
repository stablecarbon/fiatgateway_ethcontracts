# fiat_gateway
Carbon's CUSD-Fiat gateway: smart contracts

[![node](https://img.shields.io/badge/Node-v8.11.4-brightgreen.svg)](https://github.com/stablecarbon/fiat_gateway)

Smart contract code audited by [New Alchemy](https://medium.com/@newalchemy/carbon-money-smart-contract-audit-c5ae62cbe5d4)

## Upgradeability
[delegatecall proxy pattern](https://blog.trailofbits.com/2018/09/05/contract-upgrade-anti-patterns/#comments)

## Deployment
To deploy, run:
`truffle migrate --network [network]`
The gas limit may have to be adjusted in `truffle-config.js`.

(Dec 18): Deployment of the entire protocol should not cost more than 2 ETH

## Contract Verification 
Code dependencies need to be flattened into a single `*.sol` contract in order for popular block explorers like etherscan.io to verify their bytecode. 

Run `sol-merger ./contracts/[CONTRACT].sol "./flatten/"` to flatten any contract into the flatten/ directory named [CONTRACT]\_merged.sol

To verify contracts created by the Factories, you will need to retrieve the ABI-ecoded constructor arguments that were passed during creation. This is a useful online [ABI encoding service](https://abi.hashex.org/)

You can also deploy the flattened contract using the [Remix IDE](https://remix.ethereum.org)

## Connecting to an Ethereum node
truffle-config currently connects to Ethereum node via websocket provided by our [Infura account](https://infura.io/)

`provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC/privateKey, "wss://mainnet.infura.io/ws" + process.env.INFURA_API_KEY_MAIN)
      },`

## Metatransactions
[Update as of November 2018: Interact with CUSD without paying ETH gas fees!](https://medium.com/gitcoin/native-meta-transactions-e509d91a8482)

New metatransaction functionality was upgraded in the `MetaToken.sol` CUSD implementation contract

## Architecture
### Core Token:

	CUSD: "CUSD" is a regulated ERC20 token redeemable into any whitelisted token, the initial of which is "WT0" (Whitelisted Token v.0)

### Our Regulators can assign accounts Permissions
### Token Permissions:

	MintPermissions: account capable of minting or issuing new CUSD or WT0 tokens to any account
	Blacklisted: account barred from interacting with active CUSD tokens

### Regulator Permissions:

	Validator: account capable of setting user permissions/roles including MintPermissions and Blacklisted

### Architecture Description

	CUSD is a Permissioned ERC20 Token whose methods are protected by a Regulator

	WhitelistedToken is also a PermissionedToken and is two-way convertible into CUSD`

## Deployment Addresses:

### Mainnet (Logic contracts are proxy "implementations", *Only the Active contracts can be used*):

[RegulatorProxyFactory](https://etherscan.io/address/0x8180522F083bF9A1F756745e5deCFf48E007D370)

[CarbonDollarProxyFactory](https://etherscan.io/address/0x4a5693fa90442aff3067b59a4256834fe612b541)

[WhitelistedTokenProxyFactory](https://etherscan.io/address/0x3aa4a0482e6f475856d98c12e71b658d0c1d0b68)

[Regulator (logic)](https://etherscan.io/address/0x0632920566c04878f948307c30f54681835a094a)

[Regulator (active)](https://etherscan.io/address/0xad439b784ff3c09fad40ee0db262eb82c8512b1f)

[CarbonDollar (logic)](https://etherscan.io/address/0x05fbf58f7171aa60df1483188071d0cf996b630e)

[CarbonDollar (active)](https://etherscan.io/address/0x1410d4ec3d276c0ebbf16ccbe88a4383ae734ed0)

[WhitelistedToken (logic)](https://etherscan.io/address/0xa832885ca9440ab6ff1d13d34ef64c037a59d3c8)

[WhitelistedToken (active)](https://etherscan.io/address/0x21683397aa53aaf7baca416c27f2c1e0e84bb493)

### Setting up CUSD token for local
1) The Regulator/CarbonDollar/Whitelisted Proxy Factories can create new CUSD, WT0, and Regulator contracts. 

`RegulatorProxyFactory.createRegulatorProxy(Regulator.address)` creates a new Regulator instance that uses the same logic as the Regulator Logic contract. For example, `RegulatorProxyFactory.createRegulatorProxy` would act as a Regulator that can regulate a Permissioned token. Importantly, since Regulators are ownable proxy contracts, ownership of newly created proxies must be claimed via `newRegulator.claimOwnership({ from: newOwner })`.

For convenience, the caller of createRegulatorProxy() is designated a Validator for that Regulator. This can be changed by the Regulator owner.

2) Now, we have to do some additional setup steps to ensure that CUSD and WT work properly.
	
i) CUSD must whitelist WT as an official stablecoin that CUSD is redeemable for

	`CUSD.listToken(WT.address, {from:cusdOwner})`

ii) To mint new tokens, the Regulator contracts for WT0 and CUSD (these contracts could be the same) must designate a minter capable of calling `mint()`

	`Regulator.setMinter(minter, {from: validator})`

iii) To set a fee charged upon redeeming CUSD into WT, the CUSD contract owner may call `CUSD.setFee(fee)` on the active CUSD contract. Fees can optionally be collected be escrowed by the CUSD contract to pay for transaction fees.

### Test locally

Look at `package.json::scripts` to see some possible test suites that we've created to rigorously test our smart contracts. For example, run `npm run test-permissioned-token` to unit test PermissionedToken.sol. Note that these tests should be run locally on a local ethereum node, which you can spin up using `npm run eth`.

Run `npm run test` to run all tests on the local network

### Test deployed contracts on the Ropsten testnet

Model scripts are provided in `./scripts/` for reading contract stats on Ropsten (or Mainnet with a small tweak) that can be run with `npm run stats-ropsten`. `npm run test-token-ropsten` will mint, transfer, and burn CUSD on Ropsten for testing purposes.

### Ropsten

[RegulatorProxyFactory](https://ropsten.etherscan.io/address/0xd5B983717e66B171e713aba404b5bB83eA65B70d)

[CarbonDollarProxyFactory](https://ropsten.etherscan.io/address/0xa7c6ade3951b5bac577f69eb514da005dd26d05c)

[WhitelistedTokenProxyFactory](https://ropsten.etherscan.io/address/0xba6dac4d0367e0a4f854296d117cad0e6d7a97b3)

[Regulator (logic)](https://ropsten.etherscan.io/address/0xD1aFc88c7F65914d3A6d3Da965A648bd2607bE41)

[Regulator (active)](https://ropsten.etherscan.io/address/0x36c18981984D58880C0378DED290f9BD2B30576E)

[CarbonDollar (logic) (this is now a MetaToken, which extends CarbonDollar)](https://ropsten.etherscan.io/address/0x5A0cd6550810ba38743Ee704743cFf135c072f6E)

[CarbonDollar (active)](https://ropsten.etherscan.io/address/0x67450c8908e2701abfa6745be3949ad32acf42d8)

[WhitelistedToken (logic)](https://ropsten.etherscan.io/address/0x14Ac5fee795105983c5cc15493fe7C034aEC31BD)

[WhitelistedToken (active)](https://ropsten.etherscan.io/address/0xcd36463470c4b92700b4d5fbe270e680d9d48968)
