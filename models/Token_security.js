const mongoose = require('mongoose');
const Token_security = mongoose.model('Token_security', new mongoose.Schema({
    contract_address: {
        type: String
    },
    is_varified: {
        type: Boolean
    },
    henypot: {
        type: Boolean,
    },
    buy_tax: {
        type: Number,
    },
    sell_tax: {
        type: Number,
    },
    proxy_contract : {
        type: Boolean,
    },
    mintable: {
        type: Boolean,
    },
    retrieve_ownerShip: {
        type: Boolean,
    },
    balance_modifiable: {
        type : Boolean,
    },
    hidden_owner : {
        type : Boolean,
    },
    self_destruct: {
        type: Boolean,
    },
    external_call_risk: {
        type : Boolean,
    },
    buy_available : {
        type : Boolean,
    },
    tax_modifiable: {
        type : Boolean,
    },
    transfer_pauseable : {
        type : Boolean,
    },
    block_list: {
        type: Boolean,
    },
    white_list: {
        type : Boolean,
    }
},
{
    timestamps: true
}
));
module.exports.Token_security   =   Token_security;



