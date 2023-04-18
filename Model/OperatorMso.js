const mongoose = require("mongoose");
const msoData = mongoose.Schema({
    
        _id : mongoose.Schema.Types.ObjectId,
        operatorId:{type : String ,index : true},
        uniqueId : String,
        isApi: {type:Boolean, default: false},
        name : {type : String},       
        status : {type : Number , index : true}
    },{ strict: false,versionKey: false });
    msoData.statics.isMsoAvailable = async function(name,operatorId){
try {
    const mso = await this.findOne({name,operatorId})
    
    return mso
} catch (error) {
    return false
    
}
    }
    const tblOperatorMso = mongoose.model('tblOperatorMso',msoData,'tblOperatorMso');
module.exports = tblOperatorMso;  