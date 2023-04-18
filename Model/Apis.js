const mongoose = require("mongoose");
const apiSchema = mongoose.Schema({
    
        _id : mongoose.Schema.Types.ObjectId,
        baseUrl:{type : String},
        partner : String,
        subPartner : {type : String},       
        status : {type : Number }
    },{ strict: false,versionKey: false });
//     apiSchema.statics.isMsoAvailable = async function(name,operatorId){
// try {
//     const mso = await this.findOne({name,operatorId})
    
//     return mso
// } catch (error) {
//     return false
    
// }
//     }
    const tblApis = mongoose.model('tblApis',apiSchema,'tblApis');
module.exports = tblApis;  