const mongoose = require("mongoose");
const operatorPreferenceSchema = require('../Model/SmsPreference');
const staffData = require('../Model/StaffData');
const bankData = require('../Model/BankData');
const invoiceType = require('./OperatorInvoiceType')
const operatorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    operatorId: { type: String, required: true, unique: true, index: true },
    name: String,
    companyName: String,
    contact: String,
    companyContact: String,
    email: String,
    address: String,
    registrationDate: {type: String },
    createTime: String,
    activationDate: {type: String },
    city: String,
    state: String,
    customerIdPriffix: { type: String, required: true, unique: true},
    upiId: String,
    cess: { type: Number, default: 0 },
    billPriffix: String,
    gstNumber: String,
    stateCode: Number,
    cableSACCode: String,
    broadbandSACCode: String,
    paymentGatwayStatus: Number,
    smsToken: String,
    smsSenderId: String,
    paymentUrl: String,
    smsCreditLeftUrl: String,
    smsUrl: String,
    smsGateway: String,
    smsRegisterdMobile: Number,
    rzpAccountId: String,
    autoCustomerId: Number,
    receiptNumber: {type:Number, default: 1},
    invoiceNumber: {type:Number, default: 1},
    openingBalCash: { type: Number , default: 0.0},
    openingBalOnline: { type: Number , default : 0.0},
    status: { type: Number, index: true },
    StaffData:
        [
            staffData
        ],
    SmsPreference: operatorPreferenceSchema,
    AreaData: Array,    
    BankData:
        [
            bankData
        ]  
}, { strict: false, versionKey: false });
const tblOperatorInfo = mongoose.model('tblOperatorInfo', operatorSchema, 'tblOperatorInfo');
module.exports = tblOperatorInfo;   