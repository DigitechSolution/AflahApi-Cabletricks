const mongoose = require("mongoose");
const bankTransactionData = require('../Model/BankTransactionsData');
const bankData = 
    {
        _id : mongoose.Schema.Types.ObjectId,
        bankName : String,
        accountNo : {type : Number,required: true},
        branch : String,
        ifscCode : String,
        transactions : [
            bankTransactionData
        ],
       
        status : Number
    };
module.exports = bankData;  