var express = require('express');
var router = express.Router();
const {News} = require("../models/News")
/* GET home page */
router.get('/getAllNews', async function(req, res, next) {
    try{
        const { performance } = require('perf_hooks');
        const startTime = performance.now();
        let news = await News.find({}).sort({createdAt : -1})
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        console.log('news api Execution time:', elapsedTime, 'milliseconds');
        res.status(200).send(news)
    }catch(error){
        res.status(400).send(error)
    }
});

module.exports = router;