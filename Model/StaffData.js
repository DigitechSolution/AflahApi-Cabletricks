const mongoose = require("mongoose");
    const staffData = {
        _id : mongoose.Schema.Types.ObjectId,
        staffId: {type : String , index : true},
        staffPin : {type : String , required : true , unique : true , index : true},
        staffName : String,
        staffContact : String,
        staffEmail : String,
        staffAddress : String,
        craetedBy : String,
        staffDuty : String,
        AppLicense : {
            licenseKey : String,
            imei : String,
            deviceName : String,
            createDate : {type: String },
            createTime :String,
            approveDate : String,
            status : {type : Number , index : true},
        },
        assignedArea : Array,
        status : {type : Number , index : true},
        
    };
module.exports = staffData;  