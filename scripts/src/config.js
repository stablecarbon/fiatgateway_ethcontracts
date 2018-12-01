const network = "ropsten"

const config = (network) => {
    if (network == "mainnet") {
        return {
            web3node: 'wss://mainnet.infura.io/ws',
            CUSD_FACTORY_ADDRESS: '0x4a5693fa90442aff3067b59a4256834fe612b541',
            CUSD_ADDRESS: '0x1410d4ec3d276c0ebbf16ccbe88a4383ae734ed0',
            WT0_FACTORY_ADDRESS: '0x3aa4a0482e6f475856d98c12e71b658d0c1d0b68',
            WT0_ADDRESS: '0x21683397aa53aaf7baca416c27f2c1e0e84bb493'
        }
    }
    else if (network == "ropsten") {
        return {
            web3node: 'wss://ropsten.infura.io/ws',
            CUSD_FACTORY_ADDRESS: '0xa7c6ade3951b5bac577f69eb514da005dd26d05c',
            CUSD_ADDRESS: '0x67450c8908e2701abfa6745be3949ad32acf42d8',
            WT0_FACTORY_ADDRESS: '0xba6dac4d0367e0a4f854296d117cad0e6d7a97b3',
            WT0_ADDRESS: '0xcd36463470c4b92700b4d5fbe270e680d9d48968'
        }
    }
}

export default config(network) 