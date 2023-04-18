const mongoose = require("mongoose")
const date = require('date-and-time')
const operatorPreferenceSchema = {
    smsReceipt :{ type : Boolean, default: false },
    smsCustomerRegistration : { type : Boolean, default: false },
    smsInvoice : { type : Boolean, default: false },
    smsActivation : { type : Boolean, default: false },
    smsDeactivation : { type : Boolean, default: false },
    smssercus : { type : Boolean, default: false },
    smsserdeladone : { type : Boolean, default: false },
    smsEmployeeWorkAssingn : { type : Boolean, default: false },
    smsCustomerWorkeDone : { type : Boolean, default: false },
    smsComplaintReg : { type : Boolean, default: false },
    smsComplaintExtent : { type : Boolean, default: false },
    smsOnetimeCharge : { type : Boolean, default: false },
    smsPendingAmount : { type : Boolean, default: false },
    smsOutstatndingAmount : { type : Boolean, default: false },
    smsDailyReport : { type : Boolean, default: false },
    pendingAmountFrequencyType : Number,
    pendingAmountDate : {type: String},
    pendingAmountLimit : { type: Number ,default : 0.0},
    pendingAmountSmsTo : Number,
    smsGatewayCollection :{ type : Boolean, default: false },
    disconnectionIntimationLanguage : String  
};
module.exports = operatorPreferenceSchema;   