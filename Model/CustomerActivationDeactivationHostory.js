const customerActivationDeativationData =
{   
    createDate: {type: String},
    actionType: String,    
    createBy: String,
    remarks : String,
    status: { type: Number, index: true },


};
module.exports = customerActivationDeativationData;  