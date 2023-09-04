

const{News} = require("../models/News")

module.exports = {
    deleteOldNews :() => {
        return new Promise(async (resolve) => {
            try{
                let oneMonthOldDate = new Date()
                oneMonthOldDate.setMonth(oneMonthOldDate.getMonth()-1); 
                let status = await News.deleteMany({createdAt : {$lte : oneMonthOldDate} })
                resolve(status.deletedCount)
            }catch(error){
                console.log(error)
                resolve(error)
            }
        })
    },


    getNewsForTwitter : () => {
        return new Promise(async(resolve) => {
            try{
                let news = await News.find({ twitter_post_status : false})
                resolve(news)
            }catch(error) {
                console.log(error)
                resolve(error)
            }
        })
    },


    updateNewsStatus : (idArray) => {
        return new Promise(async(resolve) => {
            try{
                console.log("Arry ids ===>>>>", idArray)
                let status = await News.updateMany({_id : {$in : idArray}}, {$set: {twitter_post_status: true}})
                console.log("response data ===>>>>", status)
                resolve(true)
            }catch(error) {
                console.log(error)
                resolve(error)
            }
        })
    }
}