const { EvmChain } = require("@moralisweb3/common-evm-utils");
const {Real_time_token} = require("../models/Real_time_token")
const {Token_security} = require("../models/Token_security")
const{News} = require("../models/News")
const request = require('request');
const cheerio = require("cheerio")
const newsHelper = require("../custom_helper/newsHelper")
const searchHelper = require("../custom_helper/searchHelper");
const tokenHelper = require("../custom_helper/tokenHelper")
const Twit = require('twit');
const tokenABI = require("../abi/tokenAbi.json")
const axios = require("axios")
const pm2 = require('pm2');
const moment = require("moment");

// Create a new Twit instance with your Twitter API credentials
const T = new Twit({
    consumer_key: 'YOUR_CONSUMER_KEY',
    consumer_secret: 'YOUR_CONSUMER_SECRET',
    access_token: 'YOUR_ACCESS_TOKEN',
    access_token_secret: 'YOUR_ACCESS_TOKEN_SECRET',
});

module.exports = {
    delete_oldEther_mintedTokens : async() => {
        try{
            console.log("Delete Old minetd token api start")
            await searchHelper.deleteOldMintedTokens()
        }catch(error){
            console.log(error)
        }
    },

    updateRealTime_Token_DetailUpdate: async() => {
        try {      
            let tokenDetails = await searchHelper.getNewMintedToken();
            if(tokenDetails){
                const contractAddressArray = tokenDetails.map((obj) => obj.contract_address);
                const numsPerGroup = Math.ceil(contractAddressArray.length / 30);
                const totalArray = new Array(40)
                .fill('')
                .map((_, i) => contractAddressArray.slice(i * numsPerGroup, (i + 1) * numsPerGroup));
                for (let addressLoop = 0; addressLoop < totalArray.length; addressLoop++) {
                    let contractAddressArray = totalArray[addressLoop]
                    let convertIntoString = contractAddressArray.toString();
                    const replacedString = convertIntoString.replace(/,/g, ' ');
                    let address = tokenDetails[addressLoop].contract_address
                    let mongoId=  tokenDetails[addressLoop]._id
                    try{
                        if(replacedString){                        
                            const response = await axios.get(
                                ` https://api.dexscreener.com/latest/dex/search/?q=${replacedString}`,
                                {
                                    headers: {
                                    'X-CMC_PRO_API_KEY': "c0e27826-e94d-43f3-a6bd-a170c93d3e38",
                                    },
                                }
                            ); 
                            for(let loopResult=0; loopResult<response.data.pairs.length; loopResult++){
                                let responseData = response.data.pairs[loopResult]
                                let baseTokenSymbol = responseData.baseToken.symbol
                                let baseTokenName = responseData.baseToken.name
                                let priceInUsdt = responseData.priceUsd
                                let volume = responseData.volume.h24
                                let liquidity = responseData.liquidity.usd
                                console.log(`
                                    baseToken name: ${baseTokenName}
                                    base token symbol ${baseTokenSymbol}
                                    token_price_usdt: ${priceInUsdt}
                                    volume: ${volume}
                                    liquidity: ${liquidity}
                                    address ${address}
                                    mongoId ${mongoId}
                                `)
                                await Real_time_token.updateOne({_id : mongoId, contract_address : address}, {$set : {volume_24 :volume, token_price_usdt :priceInUsdt , usdt_liquidity: liquidity, token_name : baseTokenName, token_symbol: baseTokenSymbol }})
                            }
                        }else{
                            console.log("empty")
                        }
                    }catch(err){
                        console.log("Api not return data")
                    }
                }
            }else{
                console.log("No record found!")
            }
        }catch(error){
            console.log("Api not returned data")
        }
    },

    updateToken_logo : async() => {
        try{
            let contractAddress = "0x2f7b0D229e0DA42738Ef919b675dA7e4B9994B6f"
            const etherscan = require("etherscan");
            const apiKey = "KB2H8V4P3ZBTI9A5G6UVU2T5JDNPGV79XZ";
            const token = await etherscan.getTokenInfo(contractAddress, { apiKey });
            console.log(token)
        }catch(error){
            console.log(error)
        }
    },

    bitcoinist_scraper : async() => {
        try{
            var options1 = {
                'method': 'GET',
                'url': 'https://bitcoinist.net/feed',
                'headers': {
                }
            };
            request(options1,async function (error, response) {
                let titleArray=[]
                let linkArray =[]
                let imageArray=[]
                let descriptionArray=[]

                const html = response.body;
                const $ = cheerio.load(html);
                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content: descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log("error===>")
        }
    },
    
    beincrypto_scraper : async() => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
            var options = {
                'method': 'GET',
                'url': 'https://beincrypto.com/feed',
                'headers': {
                    'Cookie': '__cf_bm=S.7SjBze5phmmhvysd8_StWyyAFt77PYGddWUp07U90-1687533117-0-Acfeoy5GAQpl2Pys5gKKTCoVYZpGDqs4J56G92/sNgwazmICEUEU4dcM0MPd074KeHZmhWFeSS8B+QIxszhkRUXAN9bE6xr5EChXbdN0Mszn'
                }
            };
            request(options, async function (error, response) {
                let  responseBeincrpto = await response.body; 
                const $ = cheerio.load(responseBeincrpto)
               
                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                const t = cheerio.load(responseBeincrpto, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });

                console.log("length ===>>>>", titleArray.length)
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log("error===>")
        }
    },
           
    coingape_scraper : () => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
            var options3 = {
                'method': 'GET',
                'url': 'https://coingape.com/feed/',
                'headers': {
                }
            };
            request(options3, async function (error, response) {
            if (error) throw new Error("error");
                let  responseBeincrpto = await response.body; 
                const $ = cheerio.load(responseBeincrpto)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                const t = cheerio.load(responseBeincrpto, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    cryptobriefing_scraper : () => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
           var options4 = {
                'method': 'GET',
                'url': 'https://cryptobriefing.com/feed/',
                'headers': {
                }
            };
            request(options4, async function (error, response) {
            if (error) throw new Error("error");
                console.log(response.body);

                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    cryptodaily_scraper : () => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
            var options5 = {
                'method': 'GET',
                'url': 'https://cryptodaily.co.uk/feed/',
                'headers': {
                  'Cookie': 'XSRF-TOKEN=eyJpdiI6ImIzOENtTTBIa1lEOGhQcTkweXc3N1E9PSIsInZhbHVlIjoiYlwvVHdSeUlFdGV5a21GR00yQ0dxUVNkXC9aY0w2a1dkN3dpbkU0SzVTcHk3Rm1ObFwvN1dwWkxpc1RrMEJwbndkdSIsIm1hYyI6ImU5NDNhOGUyZmM2MjhlODNlNjVmNTAzOGQyZjgzYmNjMDk1NjA5NDBjNmZkYTVkMDQ4NTJmZTk0ZDE3ZjNiYzQifQ%3D%3D; laravel_session=eyJpdiI6IkxQWFwvZEo5c1Y1RXpGYVZ1d0ZjYTNRPT0iLCJ2YWx1ZSI6IkpqejZFN3F4eFU5SHFnTTdCXC9QNThRclBTd01aXC9oU3BwRHJZXC9hNkxmTXl5NDBTT3lZUE10Z2Q1NkhDSTBuK0oiLCJtYWMiOiJhNTYwNWQ2MzAyZGNjNjRjNGNkMTMwNTM1MDg2ODhmMTNiYzZmOGZkZGRiMTMyNTVlYThkMGUzMzFmNjQ1NWRhIn0%3D'
                }
            };
            request(options5, async function (error, response) {
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    } 
                    const subject = titleArray[news_data]
                    .replaceAll('<![CDATA[', '')
                    .replaceAll(']]>', '')
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : subject},{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    crypto_scraper : () => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
            var options6 = {
                'method': 'GET',
                'url': 'https://crypto.news/feed/',
                'headers': {
                }
            };
            request(options6, async function (error, response) {
            if (error) throw new Error("error");

                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    cryptoglobe_scraper : () => {
        try{
            let titleArray=[]
            let linkArray =[]
            let imageArray=[]
            let descriptionArray=[]
            var options7 = {
                'method': 'GET',
                'url': 'https://www.cryptoglobe.com/rss/feed.xml',
                'headers': {
                }
            };
            request(options7, async function (error, response) {
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });

                const t = cheerio.load(html, { xmlMode: true });

                t('item image').each((imageIndex, element) => {
                    const ImageUrl = t(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });

                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });

                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    const subject = titleArray[news_data]
                        .replaceAll('<![CDATA[', '')
                        .replaceAll(']]>', '')
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : subject},{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    cryptopotato_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options8 = {
                'method': 'GET',
                'url': 'https://cryptopotato.com/feed/',
                'headers': {
                }
            };
            request(options8, async function (error, response) {
                // if (error) throw new Error("error");
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    cryptoslate_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options9 = {
                'method': 'GET',
                'url': 'https://cryptoslate.com/feed/',
                'headers': {
                }
            };
            request(options9,async function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
                
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    finbold_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options9 = {
                'method': 'GET',
                'url': 'https://finbold.com/feed/',
                'headers': {
                }
            };
            request(options9, async function (error, response) {
                if (error) throw new Error("error");

                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });

                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },   

    forkast_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options9 = {
                'method': 'GET',
                'url': 'https://forkast.news/feed/',
                'headers': {
                }
            };
            request(options9, async function (error, response) {
                if (error) throw new Error("error");
                
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    nftnewstoday_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options9 = {
                'method': 'GET',
                'url': 'https://nftnewstoday.com/feed/',
                'headers': {
                }
            };
            request(options9,async function (error, response) {
                if (error) throw new Error("error");
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
                
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    today_scraper : () => {
        try{
            let titleArray = []
            let linkArray = []
            let imageArray = []
            let descriptionArray = []
            var options9 = {
                'method': 'GET',
                'url': 'https://u.today/rss',
                'headers': {
                }
            };
            request(options9,async function (error, response) {
                if (error) throw new Error("error");
                let  html = await response.body; 
                const $ = cheerio.load(html)

                $('item title').each((index, element) => {
                    const title = $(element).text();
                    titleArray[index] = title
                });
            
                $('item media\\:content').each((imageIndex, element) => {
                    const ImageUrl = $(element).attr('url');
                    imageArray[imageIndex] = ImageUrl
                });
                    
                const t = cheerio.load(html, { xmlMode: true });
                t('item link').each((indexLink, element) => {
                    const link = t(element).text();
                    linkArray[indexLink] = link
                });

                t('item description').each((indexDes, element) => {
                    const description = t(element).text();
                    descriptionArray[indexDes] = description
                });
                for(let news_data = 0; news_data < titleArray.length; news_data++ ){
                    let insertObject = {
                        image:  imageArray[news_data],
                        content : descriptionArray[news_data],
                        feed_clickurl :  linkArray[news_data],
                        twitter_post_status: false
                    }
                    if(imageArray[news_data] &&  imageArray[news_data].includes("https://www.youtube.com") == false){
                        await News.updateOne({subject : titleArray[news_data] },{$set: insertObject}, {upsert: true})
                    }
                }
                console.log("Successfully saved!")
            });
        }catch(error){
            console.log(error)
        }
    },

    deleteNews_afterOne_month : async() => {
        console.log("News Cron is running ====>>>>>>>")
        let response = await newsHelper.deleteOldNews()
        console.log(`
            response ===>>>>>>", ${response}
            News Cron End ====>>>>>>> 
        `)
    },

    postNewsIn_Twitter : async() => {
        try{
            let getNewsData = await newsHelper.getNewsForTwitter();
            if(getNewsData.length > 0){
                const extractedFields = getNewsData.map(({ subject, content }) => ({ subject, content }));
                // Function to post multiple tweets with subjects in bulk

                // extractedFields.forEach((news, index) => {
                //     const { subject, content } = news;
                //     const status = `Subject: ${subject}\n\n${content}`;
                //     T.post('statuses/update', { status }, async(err, data, response) => {
                //         if (err) {
                //             console.log(`Error posting tweet ${index + 1}:`, err);
                //         } else {
                //             console.log(`Tweet ${index + 1} posted successfully!`);
                //          }
                //     });
                // });
                const extractedIds = getNewsData.map(obj => obj._id);
                await newsHelper.updateNewsStatus(extractedIds)
            }else{
                console.log("No news found for twitter post")
            }
        }catch(error){
            console.log(error)
        }
    },

    pm2_management_service : async() => {
        try {
            let lastTokenDetail = await  tokenHelper.getLastTokenDetail()
            let mintedTime = lastTokenDetail.minted_time;
            let currentTime = new Date();
            const startTime = moment(mintedTime);
            const endTime = moment(currentTime);
            const timeDifference = endTime.diff(startTime, "minutes");
            console.log(timeDifference); 
            if(timeDifference >= 10){
                pm2.connect((error) => {
                    if (error) {
                        console.error('Error connecting to PM2:', error);
                        process.exit(1);
                    }
                    const processName = 'Ether-realTime-Socket';
                    pm2.restart(processName, (restartError) => {
                        if (restartError) {
                            console.error(`Error restarting process '${processName}':`, restartError);
                            pm2.disconnect();
                            process.exit(1);
                        }
                        console.log(`Process '${processName}' restarted successfully.`);
                        pm2.disconnect();
                    });
                });
            }else{
                console.log("Process is running no need to restart")
            }
        }catch(error){
            console.log(error)
        }
    },

    tokenSecurity_informationUpdate : async() => {
        try{
            const { GoPlus, ErrorCode } = require("goplus-sdk-js");
            let chainId = "1";
            let tokenDetails = await tokenHelper.getNewMintedTokenDetails();  
            console.log("token length ===>>>>", tokenDetails.length)          
            if(tokenDetails){
                for (let addressLoop = 0; addressLoop < tokenDetails.length; addressLoop++) {
                    let contract_address = tokenDetails[addressLoop].contract_address;
                    var mongodb = tokenDetails[addressLoop]._id;
                    let addresses = contract_address.toLowerCase() 
                    let ret = await GoPlus.tokenSecurity(chainId, addresses);
                    if(  Object.keys(ret.result).length > 0 ){
                        let hidden_owners = ( !ret.result[addresses].hasOwnProperty('hidden_owner') || ret.result[addresses]?.hidden_owner == 0 || ret.result[addresses].hidden_owner == undefined) ? false : true
                        let self_destructor = (ret.result[addresses].selfdestruct== 0 || ret.result[addresses].selfdestruct == undefined) ? false : true
                        let sell_tax = (ret.result[addresses].sell_tax == 0 || ret.result[addresses].sell_tax == undefined) ? 0 :  ret.result[addresses].sell_tax;
                        let buy_tax = ret.result[addresses].buy_tax == 0 || ret.result[addresses].buy_tax == undefined ? 0 : ret.result[addresses].buy_tax;
                        let mintable = ret.result[addresses].is_mintable == 0 || ret.result[addresses].is_mintable == undefined ? false : true
                        let is_proxy = ret.result[addresses].is_proxy == 0 || ret.result[addresses].is_proxy == undefined ? false : true;
                        let henPot = ret.result[addresses].is_honeypot == 0 || ret.result[addresses].is_honeypot == undefined ? false : true;
                        let external_call_risk = ret.result[addresses].external_call == 0 || ret.result[addresses].external_call == undefined ? false: true
                        let transfer_pausable = ret.result[addresses].transfer_pausable == 0 || ret.result[addresses].transfer_pausable == undefined ? false : true
                        let is_blacklisted = ret.result[addresses].is_blacklisted == 0 ||  ret.result[addresses].is_blacklisted == undefined ? false : true
                        let is_whitelisted = ret.result[addresses].is_whitelisted == 0 || ret.result[addresses].is_whitelisted == undefined ? false : true
                        let buy_available = ret.result[addresses].cannot_buy == 1 ? false : true
                        let is_varified = ret.result[addresses].is_open_source == 0 || ret.result[addresses].is_open_source == undefined ? false : true
                        let retrieve_ownerShip = ret.result[addresses].owner_address == "0x0000000000000000000000000000000000000001" || ret.result[addresses].owner_address == "0x0000000000000000000000000000000000000000" || ret.result[addresses].owner_address == "" || ret.result[addresses].owner_address == undefined ? false : true
                        let owner_change_balance = ret.result[addresses].owner_change_balance == 0 || ret.result[addresses].owner_change_balance == undefined ? false : true
                        let slippage_modifiable = ret.result[addresses].slippage_modifiable == 0 || ret.result[addresses].slippage_modifiable == undefined ? false : true
                        let insertObject = {
                            tax_modifiable: slippage_modifiable, 
                            balance_modifiable: owner_change_balance,
                            retrieve_ownerShip: retrieve_ownerShip,
                            is_varified: is_varified,
                            buy_available : buy_available,
                            henypot: henPot, 
                            buy_tax: buy_tax, 
                            sell_tax: sell_tax, 
                            proxy_contract : is_proxy,
                            mintable: mintable,
                            hidden_owner : hidden_owners,
                            self_destruct:  self_destructor,
                            external_call_risk: external_call_risk,
                            transfer_pauseable : transfer_pausable,
                            block_list: is_blacklisted,
                            white_list: is_whitelisted
                        }
                        console.log("inserted Onbject ===>>>>", insertObject)
                        await Token_security.updateOne({contract_address}, {$set : insertObject}, {upsert: true})
                        await Real_time_token.updateOne({_id : mongodb}, {$set: {security_info : true}})
                    }else{
                        await Real_time_token.updateOne({_id : mongodb}, {$set: {security_info : true}})
                        console.log("No record")
                    } 
                }//end loop
            }else{
                console.log("No record found!")
            }
        }catch(error){
            await Real_time_token.updateOne({_id : mongodb}, {$set: {security_info : true}})
            console.log(error)
        }
    }
}
