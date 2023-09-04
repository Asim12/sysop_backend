// let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/b_J0rV5-81u-OwjBa-q4dVzAJWwtoS6b'
let RPCURL = "wss://eth-mainnet.g.alchemy.com/v2/Mx__31kRj4ER2bACIycLpfRYz2GBSR7-"

let WETHAddress= '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
let factoryAddress= '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
let recipientAddress= '0x81D84b1C6656aafc194b34feC426C19e63eEE431'  
let routerAddress= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
let mnemonicPhrase = 'slow sound beyond inhale husband during next weasel east library split matrix'
const connection = require("../dbconnection/db")
connection()
const {Real_time_token} = require("../models/Real_time_token")
const ethers = require('ethers')
async function startDetection() {
    const addresses = {
        WETH: WETHAddress,
        factory: factoryAddress, 
        router: routerAddress,
        recipient: recipientAddress 
    }
    const mnemonic = mnemonicPhrase 
    const provider = new ethers.providers.WebSocketProvider(RPCURL);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const account = wallet.connect(provider);
    const factory = new ethers.Contract(
        addresses.factory,
        ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
        account
    );
    console.log(`Listening for new pairs...\n`)
    factory.on('PairCreated', async (token0, token1, pairAddress) => {
    try{
        console.log(`
            New pair detected
            =================
            token0: ${token0}
            token1: ${token1}
            pairAddress: ${pairAddress}
        `);
        let tokenContractAdderss =  (token0 == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ? token1 : token0
        let insertObject = {
            chain : "WETH",
            token_name : "",
            token_symbol : "",
            token_logo : "",
            liquidity  :  0,
            minted_time : new Date(),
            token_price_usdt :0,
            pair_address : pairAddress,
            usdt_liquidity : 0,
            volume_24 : 0
        }
        console.log(insertObject)
        await Real_time_token.updateOne({contract_address : tokenContractAdderss},{$set: insertObject}, {upsert: true})
    }catch(error){
        console.log("error", error)
        startDetection()
    }
    });
}
startDetection()