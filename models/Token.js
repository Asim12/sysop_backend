const mongoose = require('mongoose');
const Token = mongoose.model('Token', new mongoose.Schema({
    rank: {
        type: Number,
        required : true     
    },
    token_name: {
        type: String,
        required : true    
    },
    token_symbol: {
        type: String,
        required : true    
    },
    token_logo: {
        type: String,
        required : true    
    },
    token_decimals : {
        type: Number,
        required : true
    },
    contract_address: {
        type: String,
        required: true    
    },
    price_usd: {
        type: Number,
        required: true    
    },
    price_24h_percent_change: {
        type: Number,
        required: true    
    },
    price_7d_percent_change: {
        type: Number,
        required: true    
    },
    market_cap_usd : {
        type : Number,
        required : true
    }
},
{
    timestamps: true
}
));
module.exports.Token   =   Token;
