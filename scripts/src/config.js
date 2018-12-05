// @dev choices of network [ mainnet, ropsten ]
const network = "mainnet"
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

const config = (network) => {
    if (network == "mainnet") {
        return {
            web3node: 'wss://mainnet.infura.io/ws',
            CUSD_FACTORY_ADDRESS: '0x4a5693fa90442aff3067b59a4256834fe612b541',
            CUSD_ADDRESS: '0x1410d4ec3d276c0ebbf16ccbe88a4383ae734ed0',
            CUSD_MODEL_ADDRESS: '0x05fbf58f7171aa60df1483188071d0cf996b630e',
            WT0_FACTORY_ADDRESS: '0x3aa4a0482e6f475856d98c12e71b658d0c1d0b68',
            WT0_ADDRESS: '0x21683397aa53aaf7baca416c27f2c1e0e84bb493',
            WT0_MODEL_ADDRESS: '0xa832885ca9440ab6ff1d13d34ef64c037a59d3c8',
            REGULATOR_FACTORY_ADDRESS: '0x8180522F083bF9A1F756745e5deCFf48E007D370',
            REGULATOR_MODEL_ADDRESS: '0x0632920566c04878f948307c30f54681835a094a',
            REGULATOR_ACTIVE_ADDRESS: '0xad439b784ff3c09fad40ee0db262eb82c8512b1f',
            MINTER_KEY: process.env.MAINNET_MINTER_KEY,
        }
    }
    else if (network == "ropsten") {
        return {
            web3node: 'wss://ropsten.infura.io/ws',
            CUSD_FACTORY_ADDRESS: '0xa7c6ade3951b5bac577f69eb514da005dd26d05c',
            CUSD_ADDRESS: '0x67450c8908e2701abfa6745be3949ad32acf42d8',
            CUSD_MODEL_ADDRESS: '0x5A0cd6550810ba38743Ee704743cFf135c072f6E',
            WT0_FACTORY_ADDRESS: '0xba6dac4d0367e0a4f854296d117cad0e6d7a97b3',
            WT0_ADDRESS: '0xcd36463470c4b92700b4d5fbe270e680d9d48968',
            WT0_MODEL_ADDRESS: '0x14Ac5fee795105983c5cc15493fe7C034aEC31BD',
            REGULATOR_FACTORY_ADDRESS: '0xd5B983717e66B171e713aba404b5bB83eA65B70d',
            REGULATOR_MODEL_ADDRESS: '0xD1aFc88c7F65914d3A6d3Da965A648bd2607bE41',
            REGULATOR_ACTIVE_ADDRESS: '0x36c18981984D58880C0378DED290f9BD2B30576E',
            MINTER_KEY: process.env.ROPSTEN_MINTER_KEY
        }
    }
}

export default config(network) 