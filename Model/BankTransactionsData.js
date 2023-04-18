const mongoose = require("mongoose")
const date = require('date-and-time')
const bankTransactionData = {
    _id : mongoose.Schema.Types.ObjectId,
    createdBy : String,
    createDate : {type: String},
    createTime :String,
    amount :{ type: Number },
    remarks : String,
    transactionType : String,
    status : {type : Number , index : true}
};
module.exports = bankTransactionData;   