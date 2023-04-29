const express = require("express");
const router = express.Router();
const TblLogin = require("../Model/Login");
const TblOperator = require("../Model/OperatorInfo");
const TblCustomerInfo = require("../Model/CustomerInfo");
const tblCustomerInvoice = require("../Model/CustomerInvoice");
const tblCustomerReceipt = require("../Model/CustomerPaymentReceipt");
const tblCustomerRequest = require("../Model/OperatorRequest");
const tblCustomerMonthlyStatement = require("../Model/CustomerMonthlyStatement");
const TblOperatorInvoiceType = require("../Model/OperatorInvoiceType");
const tblOtherExpenseAndIncome = require("../Model/OtherExpenseAndIncome");

var mongoose = require("mongoose");
const AuthMiddleware = require("../Middleware/auth");
const { randomUUID } = require("crypto");
var _ = require("underscore");
var moment = require("moment");
var jwt = require("jsonwebtoken");
const { exists, count } = require("../Model/Login");
global.constant = require("../Global");
const tblOperatorDevice = require("../Model/OperatorDevices");
const tblOperatorPackages = require("../Model/OperatorPackages");
const tblOperatorMso = require("../Model/OperatorMso");
const { resolve } = require("path");
const { rejects } = require("assert");
const tblBankOperation = require("../Model/BankOperation");
router.post("/", async (request, response) => {
  await authentication(request, response);
});

//// other expense and other income ///
router.post(
  "/otherExpenseAndIcome/:Id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const otherExpenseAndIcomeData = req.body;
    let obj = {
      opratorId: req.user.userData.operatorId,
      ...otherExpenseAndIcomeData,
      createdBy: req.params.Id,
      status: 1,
    };
    try {
      let newData = await tblOtherExpenseAndIncome.create({
        ...obj,
      });
      res.status(200).json({ data: newData, message: "created successfull!" });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);
router.get(
  "/getAllOtherExpenseAndIcome",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const otherExpensesAndIcome = await tblOtherExpenseAndIncome.find({});
      res
        .status(200)
        .json({ data: otherExpensesAndIcome, message: "fetch data success!" });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.delete(
  "/deleteOtherExpenseAndIncome/:id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      await tblOtherExpenseAndIncome.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "deleted successfully!" });
    } catch (error) {
      res.status(500).json(error.massage);
    }
  }
);

router.put(
  "/editOtherExpenseAndIcome/:id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const editData = await tblOtherExpenseAndIncome.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "updated successfully!", data: editData });
    } catch (error) {
      res.status(500).json(error.massage);
    }
  }
);

//// other expense and other income ///

//// bank operation ////
router.post(
  "/addBankAndTransactions/:Id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const { bankName, accountNumber, IFSC } = req.body;
    const transaction = {
      _id: mongoose.Types.ObjectId(),
      transactionType: req.body.transaction[0].transactionType, //  deposit or 'withdrawal', depending on your use case
      amount: req.body.transaction[0].amount,
      dateOfTransaction: req.body.transaction[0].dateOfTransaction,
      createdBy: req.params.Id,
      status: 1,
    };
    const bank = {
      operatorId: req.user.userData.operatorId,
      bankName,
      accountNumber,
      IFSC,
      status: 1,
      transaction: [transaction],
    };
    try {
      let newData = await tblBankOperation.create({
        ...bank,
      });
      res.status(200).json({ data: newData, message: "created successfull!" });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.put("/editBankDetails/:bankId/update", AuthMiddleware.verifyToken, async (req,res) => {
  try {
    const updateBankDetails = await tblBankOperation.findByIdAndUpdate(
      { _id: req.params.bankId },
      { $set: req.body },
      { new: true }
      );  
      res.status(200).json({ message: "Updated bank successfull!", data: updateBankDetails })
    } catch (error) {
      res.status(500).json(error.message)
    }
})

router.put(
  "/addTransactionToBank/:bankId/:Id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const { transactionType, amount, dateOfTransaction } = req.body;
    const createdBy = req.params.Id; // replace with actual value
    const status = 1; // replace with actual value

    const transaction = {
      _id: mongoose.Types.ObjectId(),
      transactionType,
      amount,
      dateOfTransaction,
      createdBy,
      status,
    };
    try {
      const updatedBank = await tblBankOperation.findOneAndUpdate(
        { _id: req.params.bankId },
        { $push: { transaction } },
        { new: true }
      );
      res
        .status(200)
        .json({ data: updatedBank, message: "Add Transaction successfull!" });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/getAllBankDetails",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const getAllBankDetails = await tblBankOperation.find({});
      res.status(200).json({
        data: getAllBankDetails,
        message: "get all data successfull!",
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.put(
  "/removeTransactionFromBank/:bankId/:transactionId",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const removeTransactionFromBank = await tblBankOperation.findOneAndUpdate(
        { _id: req.params.bankId },
        { $pull: { transaction: { _id: req.params.transactionId } } },
        { new: true }
      );
      res.status(200).json({
        data: removeTransactionFromBank,
        message: "remove transaction successfull!",
      });
    } catch (error) {
      res.status(200).json(error.message);
    }
  }
);

router.put(
  "/editTransaction/:bankId/:transactionId",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const { transactionType, amount, dateOfTransaction } = req.body;
    const updatedTransaction = {
      transactionType,
      amount,
      dateOfTransaction,
    };
    try {
      const updatedBank = await tblBankOperation.findOneAndUpdate(
        { _id: req.params.bankId, "transaction._id": req.params.transactionId },
        { $set: { "transaction.$": updatedTransaction } },
        { new: true }
      );
      res.status(200).json({ data: updatedBank, message: "edit successfull!" });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.post(
  "/customer/payment/:customerId",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    let responseArray = {};
    const { customerId } = req.query;
    let description = [];
    const data = req.body;
    let receiptPrefix = getReceiptPrefix();
    let totalDue = 0;
    switch (data.paymentType) {
      case "Payment":
        totalDue =
          parseFloat(data.due) -
          parseFloat(data.paidAmount) -
          parseFloat(data.discount);
        break;
      case "Adjustment":
        totalDue = parseFloat(data.due) + parseFloat(data.paidAmount);
        break;
      case "Discount":
        totalDue = parseFloat(data.due) - parseFloat(data.paidAmount);
        break;
      default:
        totalDue =
          parseFloat(data.due) -
          parseFloat(data.paidAmount) -
          parseFloat(data.discount);
        break;
    }

    await getLatestInvoice(customerId).then(async (latestData) => {
      if (latestData.length > 0) {
        latestData.map((invoice) => {
          description.push({
            name: invoice.packages._id[0].packageName,
            startDate: invoice.packages.startDate,
            endDate: invoice.packages.endDate,
          });
        });
      } else {
        description.push({
          name: "Previous Balance",
          startDate: moment(new Date(), moment.ISO_8601).format("DD/MM/YYYY"),
          endDate: moment(new Date(), moment.ISO_8601).format("DD/MM/YYYY"),
        });
      }
    });

    try {
      await getReceiptNumber(req.user.userData.operatorId).then(
        async (latestNumber) => {
          let fullReceiptNumber = `${latestNumber.receiptNumber}/${receiptPrefix}`;
          let newPayment = await tblCustomerReceipt.create({
            _id: mongoose.Types.ObjectId(),
            operatorId: req.user.userData.operatorId,
            customerId: mongoose.Types.ObjectId(customerId),
            description: description,
            amount: data.paidAmount,
            discount: parseFloat(data.discount) ?? 0,
            paidDate: moment(new Date(), moment.ISO_8601).format("DD/MM/YYYY"),
            paidTime: new Date().toLocaleTimeString(),
            custOffAmount: 0,
            paymentType: data.paymentType,
            paymentMode: data.paymentMode,
            collectionStaff: req.user.userData.loginId,
            previousDue: data.due,
            currentDue: totalDue.toFixed(2),
            paymentFrom: "Office",
            remarks: data.remarks,
            receiptNo: fullReceiptNumber,
            pdcData: {
              cheque: data.cheque,
              bank: data.bank,
              depositDate: data.depositDate,
            },
            captureStatus: "Captured",
            currency: "INR",
            methode: "Offline",
            payType: "Office",
            bank: "Nil",
            email: "Nil",
            contact: "Nil",
            fee: 0,
            tax: 0,
            errorCode: "Nil",
            errorDesc: "Nil",
            createAt: new Date().toLocaleDateString(),
            rzpAccountNo: "Nil",
            transferFee: 0,
            transferTax: 0,
            transferCreateAt: new Date().toLocaleDateString(),
            transferId: "Nil",
            regPhoneNo: "Nil",
            imei: "Nil",
            status: 1,
          });
          let monthlyStatemenetData = {
            _id: mongoose.Types.ObjectId(),
            operatorId: req.user.userData.operatorId,
            customerId: mongoose.Types.ObjectId(customerId),
            createdDate: moment(new Date(), moment.ISO_8601).format(
              "DD/MM/YYYY"
            ),
            particulars: "",
            transactionType: data.paymentType,
            transactionId: fullReceiptNumber,
            previousDue: data.due,
            debit: data.paymentType === "Adjustment" ? 0 : data.paidAmount,
            credit: data.paymentType === "Adjustment" ? data.paidAmount : 0,
            discount: parseFloat(data.discount),
            balance:
              data.paymentType === "Adjustment"
                ? parseFloat(data.due) + parseFloat(data.paidAmount)
                : parseFloat(data.due) - parseFloat(data.paidAmount),
            status: 1,
          };
          await createCustomerMonthlyStatement(monthlyStatemenetData);
          await updateCustomerDue(
            customerId,
            parseFloat(data.paidAmount) + parseFloat(data.discount),
            totalDue,
            data.paymentType
          ).then((update) => {
            responseArray = {
              status: true,
              message: "Payment Successfull",
              response: {
                resultPayment: newPayment,
              },
            };

            res.send(responseArray);
          });
        }
      );
    } catch (error) {
      res.send(error);
    }
  }
);

router.post("/getConnectionInvoiceDetails", AuthMiddleware.verifyToken, async (request, response) => {
  
  getConnectionInvoiceDetails(request, request.user.userData.operatorId).then((data) =>{
    responseArray = {
      status: data.length === 0 ? false : true,
      message: data.length === 0 ? "Authentication failed !" : "Data fetched successfully !",
      response: {            
        resultInvoice: data
      }
    };    
    // console.log(boxDat.length);   
    response.send(responseArray)
  });

});
function getConnectionInvoiceDetails(request, response,operatorId) {
return new Promise(async (resolve, reject) => { 
var post = request.body; 

tblCustomerReceipt.find({customerId : mongoose.Types.ObjectId(post.connectionId)}).exec().then((data) =>{

    resolve(data)
  })
})
}
router.post(
  "/getCustomerInfoManage",
  AuthMiddleware.verifyToken,
  async (request, response) => {
    var post = request.body;

    operatorId = request.user.userData.operatorId;

    var match = {};
    var and = {};
    if (!isEmpty(post.filter)) {
      if (post.filter.hasOwnProperty("subid_field")) {
        var or = [];
        post.filter.subid_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.operatorCustId = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.operatorCustId = val.Equals;
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.operatorCustId = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.operatorCustId = {
                $regex: `${val["Ends with"]}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.operatorCustId = { $gt: val["Greater than"] };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.operatorCustId = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.operatorCustId = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.operatorCustId = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("cusid_field")) {
        post.filter.cusid_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.autoCustIdString = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.autoCustId = parseInt(val.Equals);
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.autoCustIdString = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.autoCustIdString = {
                $regex: `${val["Ends with"]}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.autoCustId = { $gt: parseInt(val["Greater than"]) };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.autoCustId = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.autoCustId = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.autoCustId = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("name_field")) {
        var or = [];
        post.filter.name_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.custName = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.custName = val.Equals;
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.custName = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.custName = {
                $regex: `${val["Ends with"]}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.custName = { $gt: val["Greater than"] };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.custName = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.custName = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.custName = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("contact_field")) {
        post.filter.contact_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.contact = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.contact = val.Equals;
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.contact = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.contact = { $regex: `${val["Ends with"]}$`, $options: "m" };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.contact = { $gt: val["Greater than"] };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.contact = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.contact = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.contact = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("area_field")) {
        post.filter.area_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.area = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.area = val.Equals;
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.area = { $regex: `^${val["Starts with"]}`, $options: "m" };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.area = { $regex: `${val["Ends with"]}$`, $options: "m" };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.area = { $gt: val["Greater than"] };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.area = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.area = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.area = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("house_field")) {
        post.filter.house_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.houseName = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.houseName = val.Equals;
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.houseName = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.houseName = {
                $regex: `${val["Ends with"]}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.houseName = { $gt: val["Greater than"] };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.houseName = { $gte: val["Greater than or equal to"] };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.houseName = { $lt: val["Less than"] };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.houseName = { $lte: val["Less than or equal to"] };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("deviceId_field")) {
        post.filter.deviceId_field.map((val) => {
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              and = {
                assignedBox: {
                  $elemMatch: { boxData: mongoose.Types.ObjectId(val.Equals) },
                },
              };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("due_field")) {
        post.filter.due_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.dueString = { $regex: `${val.Contains}` };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.due = parseInt(val.Equals);
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.dueString = {
                $regex: `^${val["Starts with"]}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.dueString = {
                $regex: `${val["Ends with"]}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.due = { $gt: parseInt(val["Greater than"]) };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.due = { $gte: parseInt(val["Greater than or equal to"]) };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.due = { $lt: parseInt(val["Less than"]) };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.due = { $lte: parseInt(val["Less than or equal to"]) };
            }
          }
        });
      }
    }

    match.operatorId = operatorId;
    if (!match.hasOwnProperty("status")) {
      match.status = { $ne: 3 };
    }

    var count = await getCount(match);

    getCustomerManage(request, response, operatorId, count, match, and).then(
      (cusDat) => {
        responseArray = {
          status: cusDat.length === 0 ? false : true,
          message:
            cusDat.length === 0
              ? "Authentication failed !"
              : "Data fetched successfully !",
          count: count,
          response: {
            result: cusDat,
          },
        };
        response.send(responseArray);
      }
    );
  }
);
router.post("/customer/add", AuthMiddleware.verifyToken, async (req, res) => {
  const {
    operatorCustId,
    gstNo,
    custName,
    custLastName,
    houseName,
    contact,
    altContact,
    email,
    perAddress,
    initAddress,
    city,
    state,
    pin,
    createDate,
    area,
    remarks,
    custType,
    discount,
    assignedDevices,
  } = req.body.data;

  let responseArray = {};
  let assignedBox = assignedDevices.map((item) => ({
    boxData: item.selectedDevice._id,
    status: 1,
    assignedPackage: [
      {
        packageData: item.selectedPackage._id,
        invoiceTypeId: item.invoiceType,
        startDate: item.activationDate,
        endDate: item.activationDate,
        freeTier: item.freeTier === "Nil" ? 0 : parseInt(item.freeTier),
        status: 1,
      },
    ],
  }));

  let newCustomer = await TblCustomerInfo.create({
    _id: mongoose.Types.ObjectId(),
    operatorId: req.user.userData.operatorId,
    autoCustIdString: "",
    operatorCustId: operatorCustId,
    custName: custName,
    custLastName: custLastName,
    contact: contact,
    altContact: altContact,
    email: email,
    perAddress: perAddress,
    initAddress: initAddress,
    area: area,
    custType: custType,
    city: city,
    state: state,
    pin: pin,
    createDate: createDate,
    createTime: new Date().toLocaleTimeString(),
    activationDate: createDate,
    houseName: houseName,
    gstNo: gstNo,
    assignedBox: assignedBox,
    due: 0,
    dueString: "0",
    remarks: remarks,
    discount: discount === null ? 0 : discount,
    status: 2,
  });
  assignedDevices.map(async (item) => {
    await updateDeviceStatus(item.selectedDevice._id);
  });
  const requests = await createInvoice(newCustomer, 1, req.body.discount);

  Promise.all(requests).then(async () => {
    let match = {
      operatorId: req.user.userData.operatorId,
      status: { $ne: 3 },
    };
    let count = await getCount(match);
    // let newData = await TblCustomerInfo.findOne({_id: newCustomer._id}).lean()
    responseArray = {
      status: true,
      message: "Account Create Successfully",
      data: count,
    };

    res.send(responseArray);
  });
});
function getCount(match) {
  return new Promise(async (resolve, reject) => {
    let countMap = await TblCustomerInfo.aggregate([
      {
        $match: match,
      },
    ]);

    resolve(countMap.length);
  });
}
function getCustomerManage(request, response, operatorId, count, match, and) {
  return new Promise(async (resolve, reject) => {
    var post = request.body;
    let perPage;
    let page;
    if (post.rowsPerPage != "All") {
      perPage = parseInt(post.rowsPerPage);
      page = Math.max(0, post.page);
    } else {
      perPage = parseInt(count);
      page = Math.max(0, post.page);
    }

    let cust = await TblCustomerInfo.find(
      { $and: [match, and] },
      { activationDeactivationHistory: 0 }
    )
      .populate({ path: "assignedBox.boxData", model: "tblOperatorDevice" })
      .populate({
        path: "assignedBox.assignedPackage.packageData",
        model: "tblOperatorPackages",
      })
      .sort({ sortId: 1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean();
    // let cust = await  TblCustomerInfo.find(match,
    //   {"paymentReceipt" : 0, "invoice" : 0 , "activationDeactivationHistory" : 0 ,"complaints" : 0 , "activationDeactivationRequest" : 0,"ledger" : 0})
    //   .sort({sortId : 1}).skip((perPage*page)-perPage).limit(perPage).lean()

    let output = cust.map((element) => {
      return {
        ...element,
        assignedBox: element.assignedBox.map((box) => ({
          ...box.boxData,
          assignedPackage: box.assignedPackage.map((package) => ({
            _id: box._id,
            ...package.packageData,
            startDate: package.startDate,
            endDate: package.endDate,
            status: package.status,
          })),
        })),
      };
    });

    resolve(output);
  });
}
const getLatestInvoice = async (customerId) => {
  // return await tblCustomerInvoice.findOne({customerId: mongoose.Types.ObjectId(customerId)},null,{ sort: { month: -1 } },)
  return await tblCustomerInvoice.aggregate([
    {
      $match: {
        customerId: mongoose.Types.ObjectId(customerId),
      },
    },
    {
      $unwind: "$packages",
    },
    {
      $lookup: {
        from: "tblOperatorPackages",
        localField: "packages._id",
        foreignField: "_id",
        as: "packages._id",
      },
    },
    {
      $sort: {
        month: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);
};
const getReceiptNumber = async (operatorId) => {
  return await TblOperator.findOneAndUpdate(
    { operatorId: operatorId },
    { $inc: { receiptNumber: 1 } },
    {
      fields: { receiptNumber: 1, _id: 0 },
    }
  );
};
const updateCustomerDue = async (customerId, paidAmount, totalDue, type) => {
  let inc = {};
  switch (type) {
    case "Payment":
      inc = { due: -paidAmount };
      break;
    case "Adjustment":
      inc = { due: +paidAmount };
      break;
    case "Discount":
      inc = { due: -paidAmount };
      break;
    default:
      inc = { due: -paidAmount };
      break;
  }
  return await TblCustomerInfo.updateOne(
    { _id: mongoose.Types.ObjectId(customerId) },
    {
      $set: {
        dueString: totalDue + "",
      },
      $inc: inc,
    }
  );
};
const updateDeviceStatus = async (deviceId) => {
  return await tblOperatorDevice.updateOne(
    { _id: deviceId },
    {
      $set: {
        status: 3,
        activeStatus: "ACTIVE",
      },
    }
  );
};
const createInvoice = async (newCustomer, forIndex, discount) => {
  return new Promise(async (resolve, reject) => {
    let dateTillToday = [];
    let d = new Date();
    let invoicePrefix = getReceiptPrefix();

    // let currentDate = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
    // dateTillToday.push(currentDate)
    for (let index = forIndex; index <= d.getDate(); index++) {
      let currentDate =
        ("0" + index).slice(-2) +
        "/" +
        ("0" + (d.getMonth() + 1)).slice(-2) +
        "/" +
        d.getFullYear();
      dateTillToday.push(currentDate);
    }
    let result = await TblCustomerInfo.aggregate([
      {
        $match: {
          status: 2,
          _id: newCustomer._id,
        },
      },
      {
        $unwind: "$assignedBox",
      },
      {
        $match: {
          "assignedBox.status": 1,
        },
      },
      {
        $unwind: "$assignedBox.assignedPackage",
      },
      {
        $match: {
          "assignedBox.assignedPackage.endDate": { $in: dateTillToday },
          "assignedBox.assignedPackage.status": 1,
        },
      },
      {
        $lookup: {
          from: "tblOperatorPackages",
          localField: "assignedBox.assignedPackage.packageData",
          foreignField: "_id",
          as: "assignedBox.assignedPackage.assignedPackageData",
        },
      },
      {
        $lookup: {
          from: "tblOperatorInvoiceTypeData",
          localField: "assignedBox.assignedPackage.invoiceTypeId",
          foreignField: "_id",
          as: "assignedBox.assignedPackage.invoiceTypeId",
        },
      },
      {
        $project: {
          custName: 0,
          contact: 0,
          email: 0,
          perAddress: 0,
          initAddress: 0,
          area: 0,
          city: 0,
          state: 0,
          pin: 0,
          createDate: 0,
          activationDate: 0,
          houseName: 0,
          custCategory: 0,
          gstNo: 0,
          custType: 0,
          activationDeactivationHistory: 0,
          sortId: 0,
          autoCustId: 0,
          autoCustIdString: 0,
        },
      },
    ]);
    if (result.length > 0) {
      const offer = _.filter(result, function (resultPackage) {
        return resultPackage.assignedBox.assignedPackage.freeTier > 0;
      });

      offer.map(async (item) => {
        await updateFreeTier(item);
      });

      let reStructureData = await getReStructureData(result);
      let invoice = [];
      let totalDue = newCustomer.due;

      for (let item of reStructureData) {
        totalDue = totalDue + item.totalSubscription;

        let findData = _.find(invoice, function (res) {
          return res.month == item.month;
        });
        if (findData) {
          findData.subscriptionAmount =
            findData.subscriptionAmount + item.subscriptionAmount;
          findData.cgst = findData.cgst + item.cgst;
          findData.sgst = findData.sgst + item.sgst;
          findData.totalSubscription =
            findData.totalSubscription + item.totalSubscription;
          findData.packages = [...findData.packages, ...item.packages];
        } else {
          let latestNumber = await getInvoiceNumber(item.operatorId);
          let fullInvoiceNumber = `${latestNumber.invoiceNumber}/${invoicePrefix}`;
          invoice.push({
            _id: mongoose.Types.ObjectId(),
            operatorId: item.operatorId,
            customerId: item.customerId,
            invoiceNumber: fullInvoiceNumber,
            month: item.month,
            subscriptionAmount: item.subscriptionAmount,
            cgst: item.cgst,
            sgst: item.sgst,
            totalSubscription: item.totalSubscription,
            discount: discount ? item.discount : 0,
            previousDue: item.previousDue,
            packages: item.packages,
            status: item.status,
          });
        }
      }
      // Promise.all(createInvoiceData).then(async () => {
      let created = await createCustomerInvoice(invoice);
      created.map(async (invoiceCreate) => {
        let monthlyStatemenetData = {
          _id: mongoose.Types.ObjectId(),
          operatorId: invoiceCreate.operatorId,
          customerId: invoiceCreate.customerId,
          createdDate: moment(new Date(), moment.ISO_8601).format("DD/MM/YYYY"),
          particulars: "",
          transactionType: "Invoice",
          transactionId: invoiceCreate.invoiceNumber,
          previousDue: invoiceCreate.previousDue,
          debit: 0,
          credit: invoiceCreate.totalSubscription,
          discount: invoiceCreate.discount,
          balance:
            invoiceCreate.previousDue +
            invoiceCreate.totalSubscription -
            invoiceCreate.discount,
          status: 1,
        };
        await createCustomerMonthlyStatement(monthlyStatemenetData);
      });
      // })

      const requestsUpdate = reStructureData.map(async (item) => {
        await updateCustomerAndDue(item);
      });
      Promise.all(requestsUpdate).then(async () => {
        let dueAfterDiscount = totalDue;
        if (discount) {
          dueAfterDiscount = totalDue - newCustomer.discount;
        }

        const requests = await updateDueAfterDiscount(
          newCustomer._id,
          dueAfterDiscount
        );
        resolve([requests]);
      });
    } else {
      let due = 0;

      const requests = await updateCustomer(newCustomer, due);

      resolve([requests]);
    }
  });
};

const getReceiptPrefix = () => {
  let d = new Date();
  let invoicePrefix;
  let currentMonth = d.getMonth();
  let currentYear = d.getFullYear().toString().substring(2);
  if (currentMonth < 3) {
    currentYear = parseInt(currentYear) - 1;
  } else {
    currentYear = parseInt(currentYear);
  }
  invoicePrefix = `${currentYear}_${currentYear + 1}`;
  return invoicePrefix;
};
const updateFreeTier = async (items) => {
  let inc = {};

  let freeTier = items.assignedBox.assignedPackage.freeTier;
  if (freeTier > 0) {
    inc = { "assignedBox.$[box].assignedPackage.$[package].freeTier": -1 };
  }

  return await TblCustomerInfo.updateOne(
    { _id: items._id },
    {
      $inc: inc,
    },
    {
      arrayFilters: [
        { "box.boxData": mongoose.Types.ObjectId(items.assignedBox.boxData) },
        {
          "package.packageData": items.assignedBox.assignedPackage.packageData,
        },
      ],
    }
  );
};
const getReStructureData = async (result) => {
  const withoutOffer = _.filter(result, function (res) {
    return res.assignedBox.assignedPackage.freeTier == 0;
  });

  return withoutOffer.map((item) => {
    return {
      operatorId: item.operatorId,
      customerId: item._id,
      month: item.assignedBox.assignedPackage.endDate,
      subscriptionAmount:
        item.assignedBox.assignedPackage.assignedPackageData[0].packageAmount,
      cgst: getGSTAmount(
        item.assignedBox.assignedPackage.assignedPackageData[0].packageAmount,
        item.assignedBox.assignedPackage.assignedPackageData[0].withTaxAmount
      ),
      sgst: getGSTAmount(
        item.assignedBox.assignedPackage.assignedPackageData[0].packageAmount,
        item.assignedBox.assignedPackage.assignedPackageData[0].withTaxAmount
      ),
      totalSubscription:
        item.assignedBox.assignedPackage.assignedPackageData[0].withTaxAmount,
      discount: item.discount,
      previousDue: item.due,
      packages: [
        {
          _id: item.assignedBox.assignedPackage.packageData,
          packageName:
            item.assignedBox.assignedPackage.assignedPackageData[0].packageName,
          packageAmount:
            item.assignedBox.assignedPackage.assignedPackageData[0]
              .packageAmount,
          tax: item.assignedBox.assignedPackage.assignedPackageData[0].tax,
          withTaxAmount:
            item.assignedBox.assignedPackage.assignedPackageData[0]
              .withTaxAmount,
          packageType:
            item.assignedBox.assignedPackage.assignedPackageData[0].packageType,
          connectionType:
            item.assignedBox.assignedPackage.assignedPackageData[0]
              .connectionType,
          startDate: item.assignedBox.assignedPackage.startDate,
          endDate: getEndDate(
            item?.assignedBox?.assignedPackage?.invoiceTypeId,
            item?.assignedBox?.assignedPackage?.endDate
          ),
        },
      ],
      status: 1,
      assignedBox: item.assignedBox,
    };
  });
};
const getGSTAmount = (withoutTax, withTax) => {
  return (parseFloat(withTax) - parseFloat(withoutTax)) / 2;
};
const getEndDate = (invoiceTypeId, endDate) => {
  let splitDate = endDate.split("/");
  let formatDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
  let d = new Date(formatDate);
  let datestring = "";

  const { duration, durationType } = invoiceTypeId[0];

  if (durationType === "Month") {
    datestring = moment(d, moment.ISO_8601)
      .add(parseInt(duration), "months")
      .format("DD/MM/YYYY");
  }
  if (durationType === "Day") {
    datestring = moment(d, moment.ISO_8601)
      .add(parseInt(duration), "days")
      .format("DD/MM/YYYY");
  }
  return datestring;
};
const getInvoiceNumber = async (operatorId) => {
  return await TblOperator.findOneAndUpdate(
    { operatorId: operatorId },
    { $inc: { invoiceNumber: 1 } },
    {
      fields: { invoiceNumber: 1, _id: 0 },
    }
  );
};
const createCustomerInvoice = async (item) => {
  return await tblCustomerInvoice.create(item);

  // return
};
const createCustomerMonthlyStatement = async (createData) => {
  return await tblCustomerMonthlyStatement.create(createData);
};
const updateCustomerAndDue = async (item) => {
  return await TblCustomerInfo.updateOne(
    { _id: item._id },
    {
      $set: {
        "assignedBox.$[box].assignedPackage.$[package].endDate": getEndDate(
          item?.assignedBox?.assignedPackage?.invoiceTypeId,
          item?.assignedBox?.assignedPackage?.endDate
        ),
      },
    },
    {
      arrayFilters: [
        { "box.boxData": item.assignedBox.boxData },
        { "package.packageData": item.packages[0]._id },
      ],
    }
  );
};
const updateDueAfterDiscount = async (id, totalDue) => {
  return await TblCustomerInfo.updateOne(
    { _id: id },
    {
      $set: {
        dueString: totalDue + "",
        due: totalDue,
        statusString: "2",
      },
      // $inc: { 'due': totalDue }
    }
  );
};
const updateCustomer = async (item, totalDue) => {
  return await TblCustomerInfo.updateOne(
    { _id: item._id },
    {
      $set: {
        dueString: totalDue + "",
        statusString: "2",
      },
    }
  );
};
function isEmpty(object) {
  return Object.keys(object).length === 0;
}
module.exports = router;
