const cron  = require('node-cron');
const crons = require("../crone_signature/cron")
const coonection = require('../dbconnection/db')
coonection()

// cron.schedule('0 */5 * * * *', () => {
//     crons.delete_oldEther_mintedTokens();
// });

// cron.schedule('*/10 * * * * *', () => {
//     crons.updateRealTime_Token_DetailUpdate();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.nftnewstoday_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.forkast_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.cryptoslate_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.cryptopotato_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.cryptoglobe_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.bitcoinist_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.beincrypto_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.coingape_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.cryptobriefing_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.cryptodaily_scraper();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.crypto_scraper();
// });

// cron.schedule('0 0 */15 * * *', () => {
//     crons.deleteNews_afterOne_month();
// });

// cron.schedule('0 0 */6 * * *', () => {
//     crons.postNewsIn_Twitter();
// });

// cron.schedule('0 */3 * * * *', () => {
//     crons.pm2_management_service();
// });

cron.schedule('*/10 * * * * *', () => {
    crons.tokenSecurity_informationUpdate();
});









  
 
 
 
 
 
 
 
 
 
 





