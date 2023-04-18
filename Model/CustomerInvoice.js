const mongoose = require("mongoose");
const date = require('date-and-time')
const customerInvoiceData = mongoose.Schema(
{
    _id: mongoose.Schema.Types.ObjectId,
    operatorId: { type: String, required: true, index: true },
    customerId: mongoose.Schema.Types.ObjectId,
    invoiceNumber: String,
    month: {type: String},
    subscriptionAmount : { type: Number },
    cgst : { type: Number },
    sgst : { type: Number },
    igst : { type: Number },
    totalSubscription : { type: Number },
    discount: {type: Number,default: 0},
    previousDue : { type: Number },
    packages : [
        {
            _id:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'tblOperatorPackages'
                },
                packageName: {type: String },
                packageAmount: {type: String },
                tax: {type: String },
                withTaxAmount: {type: String },
                packageType: {type: String },
                connectionType: {type: String },
    startDate: {type: String },
    endDate: {type: String },
            }
    ],
    paidAmount: { type: Number ,default : 0},
    status: { type: Number, index: true },


},{ strict: false, versionKey: false });
const tblCustomerInvoice = mongoose.model('tblCustomerInvoice', customerInvoiceData, 'tblCustomerInvoice');
module.exports = tblCustomerInvoice;   