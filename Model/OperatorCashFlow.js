const mongoose = require("mongoose");
const operatorCashFlowSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    operatorId: { type: String, required: true, index: true },
    title : String,
    subTitle : String,
    amount : { type: Number},
    paymentMode : String,
    chequeNo : String,
    bank : String,
    branch : String,
    depositDate : {type: String },
    description : String,
    createDate : {type: String },
    createTime :String,
    createdBy : String,
    flowType: String,
    status : {type : Number , index : true},


}, { strict: false, versionKey: false });
const tblOperatorCashFlow = mongoose.model('tblOperatorCashFlow', operatorCashFlowSchema, 'tblOperatorCashFlow');
module.exports = tblOperatorCashFlow;   