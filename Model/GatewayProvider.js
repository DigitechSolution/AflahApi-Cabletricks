const mongoose = require("mongoose");
const gatewaySchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    prividerName : String,
    baseUrl : String,
    creditLeftUrl : String,
    status : Number,
},{ strict: false,versionKey: false });
const TblGateWayProvider = mongoose.model('TblGateWayProvider',gatewaySchema,'tblGateWayProvider');
module.exports = TblGateWayProvider;   