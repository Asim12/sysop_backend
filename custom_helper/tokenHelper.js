const {Real_time_token} = require("../models/Real_time_token")
const {Token_security} = require("../models/Token_security")

module.exports = {
    getLastTokenDetail : () => {
        return new Promise(async (resolve) => {
          let result = await Real_time_token.find({}).sort({minted_time : -1}).limit(1) 
          resolve(result[0])
        })
    },

    getNewMintedTokenDetails : () => {
        return new Promise(async(resolve) => {
            let record =  await Real_time_token.find({security_info : false},{contract_address:1}, { sort: { minted_time: -1 } }).limit(10)
            resolve(record)
        })
    },

    getTokenSecurity : (contract_address) => {
        return new Promise(async(resolve) => {
            let record =  await Token_security.find({contract_address })
            resolve(record)
        })
    }



}