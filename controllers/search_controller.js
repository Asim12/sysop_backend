var express = require('express');
var router = express.Router();
const searchHelper = require("../custom_helper/searchHelper")

router.post("/getAllChainBalance", async(req, res) => {
  let {walletAddress, chainId } = req.body
  try{
    if(walletAddress && chainId) {
      console.log("<<<<<<<<<<<<<<== TOKEN BALANCE START ==>>>>>>>>>>>>>>>")
      let balances = await searchHelper.get_tokenBalance(walletAddress, chainId)
      console.log("<<<<<<<<<<<<<<== NFT BALANCE START ==>>>>>>>>>>>>>>>")
      let NFT_balances = await searchHelper.getNFT_Balance(walletAddress, chainId)

      console.log("<<<<<<<<<<<<<<== NATIVE BALANCE START ==>>>>>>>>>>>>>>>")
      let native_balances = await searchHelper.getNative_balance(walletAddress, chainId)

      // let token_prices = await searchHelper.fetTokenPrices(balances)

      let result = []
      if(chainId == 1){

        const balanceObject = { 'ether_NFT_Balance' : NFT_balances, 'ether_token_Balance' : balances, 'ether_native_balance' :native_balances}; 
        result.push(balanceObject);
      }else if(chainId == 137){

        const balanceObject = { 'matic_NFT_Balance' : NFT_balances, 'matic_token_Balance' : balances,'matic_native_balance' :native_balances }; 
        result.push(balanceObject);
      }else if(chainId == 56){

        const balanceObject = { 'bsc_NFT_Balance' : NFT_balances, 'bsc_token_Balance' : balances, 'bsc_native_balance' :native_balances }; 
        result.push(balanceObject);
      }
      res.status(200).send(result)
    }else{
      res.status(403).send({message : "Wallet address or chainId can not be empty!"})
    }
  }catch(error){
    res.status(403).send(error)
  }
})

module.exports = router;