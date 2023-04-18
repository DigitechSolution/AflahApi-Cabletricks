const mongoose = require("mongoose");
const customerMonthlyStatement = mongoose.Schema(
            {
                _id : mongoose.Schema.Types.ObjectId,   
                operatorId: { type: String, required: true, index: true },
    customerId: mongoose.Schema.Types.ObjectId,             
        createdDate : {type: String },
        particulars : String,
        transactionType : String,
        transactionId : String ,
        previousDue:  { type: Number},
        debit : { type: Number},
        credit : { type: Number},
        discount: {type: Number,default: 0},
        balance: { type: Number},
        status : {type : Number , index : true}
            },{ strict: false, versionKey: false });
            const tblCustomerMonthlyStatement = mongoose.model('tblCustomerMonthlyStatement', customerMonthlyStatement, 'tblCustomerMonthlyStatement');
            module.exports = tblCustomerMonthlyStatement;   