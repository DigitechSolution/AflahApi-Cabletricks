const mongoose = require("mongoose");
const paymentReceiptData = mongoose.Schema(
    {
        _id : mongoose.Schema.Types.ObjectId,
        operatorId: {type: String, index: true },
        customerId: mongoose.Schema.Types.ObjectId,
        description: [{
            _id: false,
            name:{type: String },
            startDate: {type: String },
            endDate: {type: String },
        }],
        amount : { type: Number },
        discount: {type: Number,default: 0},
        paidDate : {type: String , index:true},
        paidTime : String,
        custOffAmount : { type: Number },
        paymentType : {type : String , index : true },
        paymentMode : {type : String , index : true },
        collectionStaff : String,
        previousDue : { type: Number}, 
        currentDue : { type: Number},          
        paymentFrom : String, 
        remarks : String,
        receiptNo : {type : String , index : true},
        pdcData : {
            cheque : String,
            bank :String,
            branch : String,
            depositDate  : {type: String },
        },   
        captureStatus : String,
        currency : { type : String , default : 'INR' },
        methode : String,
        payType : String,
        bank : String,
        email : String,
        contact : String,
        fee : { type: Number },
        tax : { type: Number },
        errorCode : String,
        errorDesc : String,
        createAt : {type: String },
        rzpAccountNo : String,
        transferFee : { type: Number },
        transferTax : { type: Number },
        transferCreateAt : {type: String },
        transferId : String,
        regPhoneNo : {type : String , index : true},
        imei : {type : String , index : true},
        status : {type : Number , index : true}

    },{ timeStamps: true },{ strict: false, versionKey: false });
    const tblCustomerReceipt = mongoose.model('tblCustomerReceipt', paymentReceiptData, 'tblCustomerReceipt');
module.exports = tblCustomerReceipt;  