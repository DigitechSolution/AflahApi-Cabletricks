const mongoose = require("mongoose")
const date = require('date-and-time')
const appData = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    mobile : String,
    imei : String,
    email : String,
    name : String,
    createDate : {type: String},
    accounts: [{
        _id : mongoose.Schema.Types.ObjectId,
        customerId: mongoose.Schema.Types.ObjectId,
        operatorId: String,
        loginId: String,
        createDate : {type: String},
        status:{type : Number , required : true , index : true}

}],
    status : {type : Number , required : true , index : true},
},{ strict: false,versionKey: false });
const TblAppData = mongoose.model('TblAppData',appData,'tblAppData');
module.exports = TblAppData;   