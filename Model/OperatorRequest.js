const mongoose = require("mongoose");
const operatorRequestSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    operatorId: { type: String, required: true, index: true },
    customerId: mongoose.Schema.Types.ObjectId,
    request: String,
    createBy : String,
    createDate :{type: String },
    createTime :String,
    name : String,
    address : String,
    contact : String,
    area : String,
    landmark : String,
    requestDate : {type: String },
    remarks : String,
    requestCode : String,
    requestType : String,
    status : {type : Number , index : true},
}, { strict: false, versionKey: false });
const tblOperatorRequest = mongoose.model('tblOperatorRequest', operatorRequestSchema, 'tblOperatorRequest');
module.exports = tblOperatorRequest;   