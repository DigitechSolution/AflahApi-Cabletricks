const mongoose = require("mongoose");
const invoiceTypeData = mongoose.Schema({
        _id : mongoose.Schema.Types.ObjectId,
        operatorId:String,
        title : String,
        duration : {type : Number,required: true},  
        durationType : String,      
        status : Number
    },{ strict: false,versionKey: false });
    const tblOperatorInvoiceTypeData = mongoose.model('tblOperatorInvoiceTypeData',invoiceTypeData,'tblOperatorInvoiceTypeData');
module.exports = tblOperatorInvoiceTypeData;  