const mongoose = require("mongoose")
const date = require('date-and-time')
const loginSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    loginId : {type : String , required : true , unique : true , index : true},
    password : String,
    jwtToken : String,
    operatorId : String,
    lastLogin : {type: String },
    createDate : {type: String },
    role : String,
    appLogin : {type : Boolean ,default : false},
    activationStatus : {type : Number , index : true},
    migrate : String,
    status : {type : Number , required : true , index : true},
},{ strict: false,versionKey: false });
const tblLogin = mongoose.model('tblLogin',loginSchema,'tblLogin');
module.exports = tblLogin;   