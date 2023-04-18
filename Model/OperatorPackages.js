const mongoose = require("mongoose")
const operatorPackageData = mongoose.Schema(
            {
                _id : mongoose.Schema.Types.ObjectId,
                operatorId:{type : String ,index : true},                
                packageId : {type : String , index : true},
        packageName : String,
        packageDesc : String,
        packageAmount : { type: Number, default : 0.0},
        // packageAmount : { type: String, set: function (v) { return ((Math.floor(v * 100) / 100).toFixed(2)).toString()}},
        duration : String,
        tax : Number,
        withTaxAmount : { type: Number , default : 0.0},
        createdBy : String,
        createdDate : {type: String },
        createTime : String,
        packageType : {type : String , index : true },
        connectionType : {type : String , index : true },
        startDate : {type: String },
        endDate : {type: String },
        status : {type : Number , index : true}
            }, { strict: false, versionKey: false })
    const tblOperatorPackages = mongoose.model('tblOperatorPackages',operatorPackageData,'tblOperatorPackages');
           
module.exports = tblOperatorPackages;  