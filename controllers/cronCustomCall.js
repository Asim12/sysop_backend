var express = require('express');
var router = express.Router();
const consFile = require("../crone_signature/cron")

/* GET home page */
router.get('/run_force', async function(req, res, next) {
    // await consFile.updateToken_logo()
    // await consFile.today_scraper() 
    // await consFile.nftnewstoday_scraper() 
    // await consFile.forkast_scraper() 
    // await consFile.finbold_scraper() 
    // await consFile.bitcoinist_scraper() 
    // await consFile.beincrypto_scraper() 
    // await consFile.coingape_scraper() 
    // await consFile.cryptobriefing_scraper() 
    // await consFile.cryptodaily_scraper() 
    // await consFile.crypto_scraper() 
    // await consFile.cryptoglobe_scraper() 
    // await consFile.cryptopotato_scraper() 
    // await consFile.cryptoslate_scraper()
    // await consFile.tokenSecurity_informationUpdate()
    res.status(200).send({message: "cron is running"})
});

module.exports = router;