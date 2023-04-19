const express = require("express");
const router = express.Router();
const TblLogin = require("../Model/Login");
const TblOperator = require("../Model/OperatorInfo");
const TblCustomerInfo = require('../Model/CustomerInfo');
const tblCustomerInvoice = require('../Model/CustomerInvoice');
const tblCustomerReceipt = require('../Model/CustomerPaymentReceipt');
const tblCustomerRequest = require('../Model/OperatorRequest');
const tblCustomerMonthlyStatement = require('../Model/CustomerMonthlyStatement');
const TblOperatorInvoiceType = require('../Model/OperatorInvoiceType');
var mongoose = require('mongoose')
const AuthMiddleware = require('../Middleware/auth')
const {randomUUID} = require('crypto')
var _ = require('underscore');
var moment = require('moment');
var jwt  = require('jsonwebtoken');
const { exists, count } = require("../Model/Login");
const tblOperatorDevice = require('../Model/OperatorDevices')
const tblOperatorPackages = require('../Model/OperatorPackages');
const tblOperatorMso = require("../Model/OperatorMso");
const { resolve } = require("path");
const { rejects } = require("assert");
router.post("/", async (request, response) => {
  await authentication(request, response);


});
router.post("/customer/payment/:customerId", AuthMiddleware.verifyToken, async (req, res) => {
  let responseArray = {}
  const { customerId } = req.query 
  let description = []
  const data = req.body 
  let receiptPrefix= getReceiptPrefix()
  let totalDue = 0
  switch (data.paymentType) {
    case "Payment":
      totalDue = (parseFloat(data.due) - parseFloat(data.paidAmount)) - parseFloat(data.discount)
      break;
      case "Adjustment":
        totalDue = parseFloat(data.due) + parseFloat(data.paidAmount)   
        break;
        case "Discount":
          totalDue = parseFloat(data.due) - parseFloat(data.paidAmount)
        break;
    default:
      totalDue = (parseFloat(data.due) - parseFloat(data.paidAmount)) - parseFloat(data.discount)
      break;
  }
  
  await getLatestInvoice(customerId).then(async (latestData) =>{      
    if(latestData.length > 0){
      latestData.map((invoice) =>{
        description.push({
          name: invoice.packages._id[0].packageName,
          startDate: invoice.packages.startDate,
          endDate: invoice.packages.endDate
        })
      })

    }else{
      description.push({
        name: "Previous Balance",
        startDate:moment(new Date(),moment.ISO_8601).format("DD/MM/YYYY"),
        endDate: moment(new Date(),moment.ISO_8601).format("DD/MM/YYYY")
      })
    }
   
  })

  try {
    await getReceiptNumber(req.user.userData.operatorId).then(async (latestNumber) =>{
      let fullReceiptNumber = `${latestNumber.receiptNumber}/${receiptPrefix}`
      let newPayment = await tblCustomerReceipt.create({   
        _id : mongoose.Types.ObjectId(),
        operatorId: req.user.userData.operatorId,
        customerId: mongoose.Types.ObjectId(customerId),
        description: description,
          amount : data.paidAmount,
          discount: parseFloat(data.discount) ?? 0,
          paidDate : moment(new Date(),moment.ISO_8601).format("DD/MM/YYYY"),
          paidTime : new Date().toLocaleTimeString(),
          custOffAmount : 0,
          paymentType: data.paymentType,
          paymentMode : data.paymentMode,
          collectionStaff : req.user.userData.loginId,
          previousDue : data.due,     
          currentDue: totalDue.toFixed(2),   
          paymentFrom : "Office", 
          remarks : data.remarks,
          receiptNo : fullReceiptNumber,
          pdcData : {
              cheque : data.cheque,
              bank :data.bank,
              depositDate  : data.depositDate,
          },   
          captureStatus : "Captured",
          currency : 'INR' ,
          methode : "Offline",
          payType : "Office",
          bank : "Nil",
          email : "Nil",
          contact : "Nil",
          fee : 0,
          tax : 0,
          errorCode : "Nil",
          errorDesc : "Nil",
          createAt : new Date().toLocaleDateString(),
          rzpAccountNo : "Nil",
          transferFee : 0,
          transferTax : 0,
          transferCreateAt : new Date().toLocaleDateString(),
          transferId : "Nil",
          regPhoneNo : "Nil",
          imei : "Nil",
          status : 1
          
      })
      let monthlyStatemenetData ={
        _id: mongoose.Types.ObjectId(),
            operatorId: req.user.userData.operatorId,
            customerId: mongoose.Types.ObjectId(customerId),
            createdDate: moment(new Date(),moment.ISO_8601).format("DD/MM/YYYY"),
            particulars: "",
            transactionType: data.paymentType,
            transactionId: fullReceiptNumber,
            previousDue: data.due,
            debit: data.paymentType === "Adjustment" ? 0 :  data.paidAmount,
            credit: data.paymentType === "Adjustment" ? data.paidAmount : 0 ,
            discount: parseFloat(data.discount),
            balance: data.paymentType === "Adjustment" ? parseFloat(data.due) + parseFloat(data.paidAmount) : parseFloat(data.due) - parseFloat(data.paidAmount),
            status: 1
        }
      await createCustomerMonthlyStatement(monthlyStatemenetData)
      await updateCustomerDue(customerId,parseFloat(data.paidAmount)+parseFloat(data.discount),totalDue,data.paymentType).then((update) =>{
        responseArray = {
          status: true,
          message: "Payment Successfull",
          response: {            
            resultPayment: newPayment
          }
          
      }
      
        res.send(responseArray)
      })
    
    })
  } catch (error) {
          res.send(error)
    
      }
 
   
})
router.post("/getCustomerInfoManage", AuthMiddleware.verifyToken,async (request, response) => {
  var post = request.body;  
  
    operatorId = request.user.userData.operatorId
    
    if(err)
    response.send(403);
    else{ 
      var match ={ }
    var and = {}
    if(!isEmpty(post.filter)){  
      
      if(post.filter.hasOwnProperty('subid_field')){
        var or=[]
        post.filter.subid_field.map((val) => {
         if(typeof val.Contains != 'undefined'){
          if(val.Contains != "All")
          {
          match.operatorCustId = { $regex: `${val.Contains}`}
          }
          
         }
         if(typeof val.Equals != 'undefined'){
          if(val.Equals != "All")
          {
          match.operatorCustId = val.Equals
          }
          
         }
         if(typeof val['Starts with'] != 'undefined'){   
          if(val['Starts with'] != "All")
          {       
          match.operatorCustId = { $regex: `^${val['Starts with']}`,$options:'m'}
         
          }
         }
         if(typeof val['Ends with'] != 'undefined'){  
          if(val['Ends with'] != "All")
          {        
          match.operatorCustId = { $regex: `${val['Ends with']}$`,$options:'m'}
          }
          
         }
         if(typeof val['Greater than'] != 'undefined'){  
          if(val['Greater than'] != "All")
          {              
          match.operatorCustId = { $gt: val['Greater than']}
          }
          
         }
         if(typeof val['Greater than or equal to'] != 'undefined'){  
          if(val['Greater than or equal to'] != "All")
          {              
          match.operatorCustId = { $gte: val['Greater than or equal to']}
          }
          
         }
         if(typeof val['Less than'] != 'undefined'){    
          if(val['Less than'] != "All")
          {            
          match.operatorCustId = { $lt: val['Less than']}
          }
          
         }
         if(typeof val['Less than or equal to'] != 'undefined'){
          if(val['Less than or equal to'] != "All")
          {                
          match.operatorCustId = { $lte: val['Less than or equal to']}
          }
          
         }
        })
      }
      if(post.filter.hasOwnProperty('cusid_field')){        
        post.filter.cusid_field.map((val) => {
         if(typeof val.Contains != 'undefined'){
          if(val.Contains != "All")
          {
          match.autoCustIdString = { $regex: `${val.Contains}`}
          }
          
         }
         if(typeof val.Equals != 'undefined'){
          if(val.Equals != "All")
          {
            match.
            autoCustId= parseInt(val.Equals)
          }
          
         }
         if(typeof val['Starts with'] != 'undefined'){   
          if(val['Starts with'] != "All")
          {       
          match.autoCustIdString = { $regex: `^${val['Starts with']}`,$options:'m'}
         
          }
         }
         if(typeof val['Ends with'] != 'undefined'){  
          if(val['Ends with'] != "All")
          {        
          match.autoCustIdString = { $regex: `${val['Ends with']}$`,$options:'m'}
          }
          
         }
         if(typeof val['Greater than'] != 'undefined'){  
          if(val['Greater than'] != "All")
          {              
            match.
            autoCustId= { $gt: parseInt(val['Greater than'])}     
          }
          
         }
         if(typeof val['Greater than or equal to'] != 'undefined'){  
          if(val['Greater than or equal to'] != "All")
          {              
          match.autoCustId = { $gte: val['Greater than or equal to']}
          }
          
         }
         if(typeof val['Less than'] != 'undefined'){    
          if(val['Less than'] != "All")
          {            
          match.autoCustId = { $lt: val['Less than']}
          }
          
         }
         if(typeof val['Less than or equal to'] != 'undefined'){
          if(val['Less than or equal to'] != "All")
          {                
          match.autoCustId = { $lte: val['Less than or equal to']}
          }
          
         }
        })
      }      
      if(post.filter.hasOwnProperty('name_field')){
        var or=[]
        post.filter.name_field.map((val) => {
         if(typeof val.Contains != 'undefined'){
          if(val.Contains != "All")
          { 
          match.custName = { $regex: `${val.Contains}`}
          }
          
         }
         if(typeof val.Equals != 'undefined'){
          if(val.Equals != "All")
          {
          match.custName = val.Equals
          }
          
         }
         if(typeof val['Starts with'] != 'undefined'){   
          if(val['Starts with'] != "All")
          {        
          match.custName = { $regex: `^${val['Starts with']}`,$options:'m'}
          }
          
         }
         if(typeof val['Ends with'] != 'undefined'){   
          if(val['Ends with'] != "All")
          {        
          match.custName = { $regex: `${val['Ends with']}$`,$options:'m'}
          }
          
         }
         if(typeof val['Greater than'] != 'undefined'){    
          if(val['Greater than'] != "All")
          {             
          match.custName = { $gt: val['Greater than']}
          }
          
         }
         if(typeof val['Greater than or equal to'] != 'undefined'){     
          if(val['Greater than or equal to'] != "All")
          {            
          match.custName = { $gte: val['Greater than or equal to']}
          }
          
         }
         if(typeof val['Less than'] != 'undefined'){     
          if(val['Less than'] != "All")
          {            
          match.custName = { $lt: val['Less than']}
          }
          
         }
         if(typeof val['Less than or equal to'] != 'undefined'){ 
          if(val['Less than or equal to'] != "All")
          {                
          match.custName = { $lte: val['Less than or equal to']}
          }
          
         }
        })
      }
      if(post.filter.hasOwnProperty('contact_field')){
      
        post.filter.contact_field.map((val) => {
          if(typeof val.Contains != 'undefined'){
            if(val.Contains != "All")
            { 
            match.contact = { $regex: `${val.Contains}`}
            }
            
           }
           if(typeof val.Equals != 'undefined'){
            if(val.Equals != "All")
            {
            match.contact = val.Equals
            }
            
           }
           if(typeof val['Starts with'] != 'undefined'){   
            if(val['Starts with'] != "All")
            {        
            match.contact = { $regex: `^${val['Starts with']}`,$options:'m'}
            }
            
           }
           if(typeof val['Ends with'] != 'undefined'){   
            if(val['Ends with'] != "All")
            {        
            match.contact = { $regex: `${val['Ends with']}$`,$options:'m'}
            }
            
           }
           if(typeof val['Greater than'] != 'undefined'){    
            if(val['Greater than'] != "All")
            {             
            match.contact = { $gt: val['Greater than']}
            }
            
           }
           if(typeof val['Greater than or equal to'] != 'undefined'){     
            if(val['Greater than or equal to'] != "All")
            {            
            match.contact = { $gte: val['Greater than or equal to']}
            }
            
           }
           if(typeof val['Less than'] != 'undefined'){     
            if(val['Less than'] != "All")
            {            
            match.contact = { $lt: val['Less than']}
            }
            
           }
           if(typeof val['Less than or equal to'] != 'undefined'){ 
            if(val['Less than or equal to'] != "All")
            {                
            match.contact = { $lte: val['Less than or equal to']}
            }
            
           }
        })
      }
      if(post.filter.hasOwnProperty('area_field')){
        
        post.filter.area_field.map((val) => {
          if(typeof val.Contains != 'undefined'){
            if(val.Contains != "All")
            { 
            match.area = { $regex: `${val.Contains}`}
            }
            
           }
           if(typeof val.Equals != 'undefined'){
            if(val.Equals != "All")
            {
            match.area = val.Equals
            }
            
           }
           if(typeof val['Starts with'] != 'undefined'){   
            if(val['Starts with'] != "All")
            {        
            match.area = { $regex: `^${val['Starts with']}`,$options:'m'}
            }
            
           }
           if(typeof val['Ends with'] != 'undefined'){   
            if(val['Ends with'] != "All")
            {        
            match.area = { $regex: `${val['Ends with']}$`,$options:'m'}
            }
            
           }
           if(typeof val['Greater than'] != 'undefined'){    
            if(val['Greater than'] != "All")
            {             
            match.area = { $gt: val['Greater than']}
            }
            
           }
           if(typeof val['Greater than or equal to'] != 'undefined'){     
            if(val['Greater than or equal to'] != "All")
            {            
            match.area = { $gte: val['Greater than or equal to']}
            }
            
           }
           if(typeof val['Less than'] != 'undefined'){     
            if(val['Less than'] != "All")
            {            
            match.area = { $lt: val['Less than']}
            }
            
           }
           if(typeof val['Less than or equal to'] != 'undefined'){ 
            if(val['Less than or equal to'] != "All")
            {                
            match.area = { $lte: val['Less than or equal to']}
            }
            
           }
        })
      }
      if(post.filter.hasOwnProperty('house_field')){
        
        post.filter.house_field.map((val) => {
          if(typeof val.Contains != 'undefined'){
            if(val.Contains != "All")
            { 
            match.houseName = { $regex: `${val.Contains}`}
            }
            
           }
           if(typeof val.Equals != 'undefined'){
            if(val.Equals != "All")
            {
            match.houseName = val.Equals
            }
            
           }
           if(typeof val['Starts with'] != 'undefined'){   
            if(val['Starts with'] != "All")
            {        
            match.houseName = { $regex: `^${val['Starts with']}`,$options:'m'}
            }
            
           }
           if(typeof val['Ends with'] != 'undefined'){   
            if(val['Ends with'] != "All")
            {        
            match.houseName = { $regex: `${val['Ends with']}$`,$options:'m'}
            }
            
           }
           if(typeof val['Greater than'] != 'undefined'){    
            if(val['Greater than'] != "All")
            {             
            match.houseName = { $gt: val['Greater than']}
            }
            
           }
           if(typeof val['Greater than or equal to'] != 'undefined'){     
            if(val['Greater than or equal to'] != "All")
            {            
            match.houseName = { $gte: val['Greater than or equal to']}
            }
            
           }
           if(typeof val['Less than'] != 'undefined'){     
            if(val['Less than'] != "All")
            {            
            match.houseName = { $lt: val['Less than']}
            }
            
           }
           if(typeof val['Less than or equal to'] != 'undefined'){ 
            if(val['Less than or equal to'] != "All")
            {                
            match.houseName = { $lte: val['Less than or equal to']}
            }
            
           }
        })
      }
      if(post.filter.hasOwnProperty('deviceId_field')){
       
        post.filter.deviceId_field.map((val) => {
        
         if(typeof val.Equals != 'undefined'){
          if(val.Equals != "All")
          { 
          and= {assignedBox:{$elemMatch: {boxData: mongoose.Types.ObjectId(val.Equals)}}}
          }
          
         }
       
        })
      }      
      if(post.filter.hasOwnProperty('due_field')){
        
        post.filter.due_field.map((val) => {
          if(typeof val.Contains != 'undefined'){
            if(val.Contains != "All")
            {
            match.dueString = { $regex: `${val.Contains}`}
            }
            
           }
           if(typeof val.Equals != 'undefined'){
            if(val.Equals != "All")
            {
              match.
              due= parseInt(val.Equals)
            }
            
           }
           if(typeof val['Starts with'] != 'undefined'){   
            if(val['Starts with'] != "All")
            {       
            match.dueString = { $regex: `^${val['Starts with']}`,$options:'m'}
           
            }
           }
           if(typeof val['Ends with'] != 'undefined'){  
            if(val['Ends with'] != "All")
            {        
            match.dueString = { $regex: `${val['Ends with']}$`,$options:'m'}
            }
            
           }
           if(typeof val['Greater than'] != 'undefined'){  
            if(val['Greater than'] != "All")
            {              
              match.
              due= { $gt: parseInt(val['Greater than'])}     
            }
            
           }
           if(typeof val['Greater than or equal to'] != 'undefined'){  
            if(val['Greater than or equal to'] != "All")
            {              
            match.due = { $gte: parseInt(val['Greater than or equal to'])}
            }
            
           }
           if(typeof val['Less than'] != 'undefined'){    
            if(val['Less than'] != "All")
            {            
            match.due = { $lt: parseInt(val['Less than'])}
            }
            
           }
           if(typeof val['Less than or equal to'] != 'undefined'){
            if(val['Less than or equal to'] != "All")
            {                
            match.due = { $lte: parseInt(val['Less than or equal to'])}
            }
            
           }
        })
      }
      
      
    }
   
    match.operatorId = operatorId
    if(!match.hasOwnProperty('status'))
    {
      match.status = {$ne: 3}
    }    
  
      var count= await getCount(match)
      
      getCustomerManage(request, response,operatorId,count,match,and).then((cusDat) =>{
        responseArray = {
          status: cusDat.length === 0 ? false : true,
          message: cusDat.length === 0 ? "Authentication failed !" : "Data fetched successfully !",
          count: count,
          response: {            
            result: cusDat
          }
        };    
        // console.log(boxDat.length);   
        response.send(responseArray)
      });
    
    }

});
function getCount (match) { 
  return new Promise(async (resolve, reject) => {    
    let countMap = await TblCustomerInfo.aggregate(
      [
        {
          $match: match
        },       
      ])
  
resolve(countMap.length)
  })
  };
function getCustomerManage(request, response,operatorId,count,match,and) {
  // console.log(match);
  return new Promise(async (resolve, reject) => {     
    var post = request.body;  
    let perPage
    let page
    if(post.rowsPerPage != "All")  
    {
    perPage= parseInt(post.rowsPerPage)
    page = Math.max(0,post.page)   
    }else{
      perPage= parseInt(count)
      page = Math.max(0,post.page)
    }    
    
  let cust = await  TblCustomerInfo.find({$and:[match,and]},
    {"activationDeactivationHistory" : 0 })
    .populate({path:'assignedBox.boxData',model:'tblOperatorDevice'}).populate({path:'assignedBox.assignedPackage.packageData',model:'tblOperatorPackages'}).sort({sortId : 1}).skip((perPage*page)-perPage).limit(perPage).lean()
  // let cust = await  TblCustomerInfo.find(match,
  //   {"paymentReceipt" : 0, "invoice" : 0 , "activationDeactivationHistory" : 0 ,"complaints" : 0 , "activationDeactivationRequest" : 0,"ledger" : 0})
  //   .sort({sortId : 1}).skip((perPage*page)-perPage).limit(perPage).lean()

    let output = cust.map(element => {
      return ({
          ...element,
          assignedBox:element.assignedBox.map(box=>({
              ...box.boxData,
              assignedPackage:box.assignedPackage.map(package=>({
                _id:box._id,                  
                  ...package.packageData,
                  startDate:package.startDate,
                  endDate:package.endDate,
                  status:package.status
              })),
              
  
          }))
      })
  })
  
    resolve(output)
   
})
}
const createCustomerMonthlyStatement=async (createData)=>{
  return await tblCustomerMonthlyStatement.create(createData)
 }
const getLatestInvoice= async (customerId)=>{
  // return await tblCustomerInvoice.findOne({customerId: mongoose.Types.ObjectId(customerId)},null,{ sort: { month: -1 } },)
  return await tblCustomerInvoice.aggregate([
    {
      $match: {
        customerId: mongoose.Types.ObjectId(customerId)
       
      }
  },
  {
    $unwind : "$packages"
  },{
    $lookup: {
      from: "tblOperatorPackages",
      localField: 'packages._id',
      foreignField: '_id',
      as: "packages._id"
    }
  },{
    $sort:{
      "month": -1
    }
  },{
    $limit: 1
  }
  ])
}
const getReceiptNumber= async (operatorId)=>{
  return await TblOperator.findOneAndUpdate({operatorId: operatorId},{$inc: {receiptNumber: 1}},{
    "fields": { "receiptNumber":1,"_id":0}
   })
}
const updateCustomerDue =async (customerId,paidAmount,totalDue,type)=>{
  let inc = {}
  switch (type) {
    case "Payment":
      inc = { 'due': - paidAmount }      
      break;
      case "Adjustment":
        inc = { 'due': + paidAmount }      
        break;
        case "Discount":
        inc = { 'due': - paidAmount }      
        break;
    default:
      inc = { 'due': - paidAmount }  
      break;
  }
  return await TblCustomerInfo.updateOne({ _id: mongoose.Types.ObjectId(customerId) },
      {
          $set: {              
              "dueString": totalDue + ""
          },
          $inc: inc
      },
      )


}
module.exports = router;