const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const activationDeactivationHistory = require("../Model/CustomerActivationDeactivationHostory")
const customerInfoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    operatorId: {type : String,index : true},
    autoCustId: {type : Number},    
    autoCustIdString: { type: String,},
    operatorCustId: {type:String},
    custName: String,
    custLastName: String,
    contact: String,
    altContact: String,
    email: String,
    perAddress: String,
    initAddress: String,
    area: String,
    city: String,
    state: String,
    pin: String,
    createDate: {type: String},
    createTime: String,
    activationDate: {type: String},
    houseName: String,
    custCategory: {type : String , default : 'N/A'},
    gstNo: String,
    custType: { type: String, default: 'N/A' },
    due: { type: Number },
    dueString:{ type: String},
    remarks:{type: String},
    discount: { type: Number ,default:0},
    status: { type: Number, index : true },
    statusString:{ type: String, index : true },
    sortId:{ type: Number, index: true},
    assignedBox : 
    [
        {
            _id: false,
            boxData:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'tblOperatorDevice'},
            assignedPackage: [{
                _id: false,
                packageData: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'tblOperatorPackages'},
                invoiceTypeId: mongoose.Schema.Types.ObjectId,
                startDate: String,
                endDate: String,
                freeTier: {type: Number, default: 0},                    
                status: Number
            }],   
             
            status : Number
        }
    ],     
    activationDeactivationHistory:
        [
            activationDeactivationHistory
        ],
               
}, {
strict:false,
versionKey: false
});

customerInfoSchema.plugin(AutoIncrement, {id:'connectionSortId_seq',inc_field: 'sortId', start_seq: 0,reference_fields:['operatorId']});
customerInfoSchema.plugin(AutoIncrement, {id:'connectionAutoCustId_seq',inc_field: 'autoCustId', start_seq: 1,reference_fields:['operatorId']});


const tblCustomerInfo = mongoose.model('tblCustomerInfo', customerInfoSchema, 'tblCustomerInfo');
module.exports = tblCustomerInfo;   