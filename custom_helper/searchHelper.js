const axios = require('axios');
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
require('dotenv').config()
const { MORALIS_APIKEY} = process.env;

SUPPORTED_CHAINS = "ETHEREUM POLYGON BSC"
var chainArray = SUPPORTED_CHAINS.split(' ');
const {Real_time_token} = require("../models/Real_time_token")
module.exports = {

    get_tokenBalance : (address, chainId) => {
        return new Promise(async (resolve) => {
            try{
                const response = await Moralis.EvmApi.token.getWalletTokenBalances({
                    "chain": chainId,
                    "address": address
                });
                resolve(response.raw);
            }catch(error){
                console.log(error)
                resolve(false)
            }
        })
    },

    getNFT_Balance : (address, chainId) => {
        return new Promise(async (resolve) => {
            try{
                const response = await Moralis.EvmApi.nft.getWalletNFTs({
                    "chain": chainId,
                    "format": "decimal",
                    "mediaItems": false,
                    "address": address
                });
                resolve(response.raw.result)
            }catch(error){
                console.log(error)
                resolve(false)
            }
        })
    },

    getNative_balance :(address, chainId) => {
        return new Promise(async(resolve) => {
            try{
                const response = await Moralis.EvmApi.balance.getNativeBalance({
                    "chain": chainId,
                    "address": address
                });
                // console.log(response.raw);
                resolve(response.raw);
            }catch(error){
                console.log(error)
                resolve(false)
            }
        })
    },

    //pending under process
    fetTokenPrices : (tokenData) => {
        return new Promise(async(resolve) => {
            try {
                const contractAddressArray = tokenData.map((obj) => obj.token_address);
                const numsPerGroup = Math.ceil(contractAddressArray.length / 60);
                console.log("number of groups: " + numsPerGroup,  " Total length: " + tokenData.length)
                const totalArray = new Array(25)
                .fill('')
                .map((_, i) => contractAddressArray.slice(i * numsPerGroup, (i + 1) * numsPerGroup));
                let responseArray = [];
                for (let addressLoop = 0; addressLoop < totalArray.length; addressLoop++) {
                    let contractAddressArray = totalArray[addressLoop]
                    let mergedArray = contractAddressArray.map((value, index) => ({
                        ["token_address"]: value,
                    }));
                    const options = {
                        method: 'post',
                        url: 'https://deep-index.moralis.io/api/v2/erc20/prices?chain=eth&include=percent_change',
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            'X-API-Key': MORALIS_APIKEY
                        },
                        data: { tokens: mergedArray }
                    };
                    axios(options)
                    // .then(response => resolve(response.data))
                    .then(response => {
                        responseArray.push(response.data);
                        // console.log(mergedResults);
                      });
                }//end loop
                resolve(responseArray);
            }catch(error){
                console.log(error)
                resolve(false)
            }    
        })    
    },

    deleteOldMintedTokens : () => {
        return new Promise(async(resolve) => {
            let detail = await Real_time_token.find({}, {minted_time:1},{ sort: { minted_time: -1 } })
            console.log("Totoal length ==>>>", detail.length)
            if(detail.length > 1200){
                let tokenMintedTime = detail[1200].minted_time
                let status = await Real_time_token.deleteMany({minted_time : {$lt : tokenMintedTime}})
                console.log(status)
            }else{
                console.log("token length is less then 1200")
            }
        })
    },

    getNewMintedToken : () => {
        return new Promise(async(resolve) => {
            let record =  await Real_time_token.find({},{contract_address:1}, { sort: { minted_time: -1 } })
            resolve(record)
        })
    }    
}


