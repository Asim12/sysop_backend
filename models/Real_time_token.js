const mongoose = require('mongoose');
const Real_time_token = mongoose.model('Real_time_token', new mongoose.Schema({
    chain: {
        type: String,
    },
    token_name: {
        type: String,
    },
    token_symbol: {
        type: String,
    },
    token_logo: {
        type: String,
    },
    contract_address: {
        type: String,
    },
    volume_24 : {
        type: Number
    },
    minted_time: {
        type: Date,
    },
    token_price_usdt: {
        type: Number,
    },
    pair_address: {
        type : String
    },
    usdt_liquidity : {
        type : Number,
    },
    security_info: {
        type : Boolean,
        default : false
    }
},
{
    timestamps: true
}
));
module.exports.Real_time_token   =   Real_time_token;
