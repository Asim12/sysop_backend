const mongoose = require('mongoose')
const News = mongoose.model('News', new mongoose.Schema({
    subject: {
        type: String,
        required : true     
    },
    image: {
        type: String,
        default : ""
    },
    content: {
        type: String,
        default : ""
    },
    feed_clickurl : {
        type: String,
        default : ""
    },
    twitter_post_status:{
        type : Boolean,
        default : false
    }
},
{
    timestamps: true
}
));
module.exports.News   =   News;

// 0. image of the article
// 1. title
// 2. description
// 3. feed clickurl - we will show on our site, and twitter (news.sysop.ai/article.php?#########)
// which will redirect to the feed url that we recorded from source