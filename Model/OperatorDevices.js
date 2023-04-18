const mongoose = require("mongoose");
const boxData = mongoose.Schema({
    
        _id : mongoose.Schema.Types.ObjectId,
        operatorId:{type : String ,index : true},
        customerId : mongoose.Schema.Types.ObjectId,
        boxId : {type : String ,index : true},
        mso : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tblOperatorMso'},
        boxType : String,
        macNo : String,
        boxNo : String,
        description : String,
        activeStatus : String,
        createdBy : String,
        createdDate : {type: String },
        createTime :String,
        connectionType : String,
        status : {type : Number , index : true}
    },{ strict: false,versionKey: false });
    const tblOperatorDevice = mongoose.model('tblOperatorDevice',boxData,'tblOperatorDevice');
module.exports = tblOperatorDevice;  