const { request } = require('express');
var express = require('express');
var router = express.Router();
const tokenHelper = require("../custom_helper/tokenHelper")


router.post("/getToken_security", async(req, res) => {
    let {contract_address} = req.body
    try{
        if(contract_address){
            let response = await tokenHelper.getTokenSecurity(contract_address)
            res.status(200).send(response)
        }else{
            res.status(403).send({message: "Contract adderess can not be empty"})
        }
    }catch(err){
        res.status(403).send({message: err})
    }
})
module.exports = router;