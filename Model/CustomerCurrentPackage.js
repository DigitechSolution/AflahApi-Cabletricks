const mongoose = require("mongoose")
const date = require('date-and-time')
const customerCurrentPackage = 
    {
        main : [
            {
        _id : mongoose.Schema.Types.ObjectId,
        packageName : String,
        packageDesc : String,
        packageAmount : { type: String, set: function (v) { return ((Math.floor(v * 100) / 100).toFixed(2)).toString()}},
        duration : Number,
        createdBy : String,
        createdDate : {type: String},
        createTime : String,
        calculationType: {type : String },
        nextCalculationDate : {type: String},
        status : {type : Number , index : true}
            }
        ],
        alacarte : [
            {
        _id : mongoose.Schema.Types.ObjectId,
        packageName : String,
        packageDesc : String,
        packageAmount : { type: Number ,default : 0.0},
        duration : Number,
        createdBy : String,
        createdDate : {type: String},
        createTime : String,
        calculationType: {type : String},
        nextCalculationDate : {type: String},
        status : {type : Number , index : true}
            }
        ]
    };
module.exports = customerCurrentPackage;  
    