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
const tblCustomerInfo = require("../Model/CustomerInfo");
const tblOperatorInfo = require("../Model/OperatorInfo");
const tblLogin = require("../Model/Login");
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
      operatorId: req.user.userData.operatorId,
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

router.put(
  "/editBankDetails/:bankId/update",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const updateBankDetails = await tblBankOperation.findByIdAndUpdate(
        { _id: req.params.bankId },
        { $set: req.body },
        { new: true }
      );
      res.status(200).json({
        message: "Updated bank successfull!",
        data: updateBankDetails,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

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

/// banck oprations ///

/// balance sheet ////

router.get("/balanceSheet", AuthMiddleware.verifyToken, async (req, res) => {
  let operatorId = req.user.userData.operatorId;
  try {
    const dataFromCustomerIncome = await tblCustomerReceipt.aggregate([
      {
        $match: {
          operatorId: operatorId,
        },
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          income: "$amount",
        },
      },
    ]);
    const dataFromOtherIncomeAndExpense =
      await tblOtherExpenseAndIncome.aggregate([
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $group: {
            _id: null,
            otherIncome: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$type", "icome"],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            expense: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$type", "expense"],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            OtherIncome: "$income",
            expense: 1,
            otherIncome: 1,
          },
        },
      ]);
    const bankDetails = await tblBankOperation.aggregate([
      [
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $unwind: {
            path: "$transaction",
          },
        },
        {
          $group: {
            _id: null,
            deposit: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$transaction.transactionType", "deposit"],
                  },
                  "$transaction.amount",
                  0,
                ],
              },
            },
            withdraw: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$transaction.transactionType", "withdraw"],
                  },
                  "$transaction.amount",
                  0,
                ],
              },
            },
          },
        },
      ],
    ]);
    const otherIncome = await tblOtherExpenseAndIncome.aggregate([
      {
        $match: {
          operatorId: operatorId,
          type: "income",
        },
      },
      {
        $group: {
          _id: {
            title: "$title",
            modeOfPayment: "$modeOfPayment",
            type: "$type",
          },
          otherIncome: {
            $sum: {
              $cond: [{}, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          title: "$_id.title",
          modeOfPayment: "$_id.modeOfPayment",
          type: "$_id.type",
          otherIncome: 1,
        },
      },
    ]);
    const otherExpense = await tblOtherExpenseAndIncome.aggregate([
      {
        $match: {
          operatorId: operatorId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: {
            title: "$title",
            modeOfPayment: "$modeOfPayment",
            type: "$type",
          },
          otherIncome: {
            $sum: {
              $cond: [{}, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          title: "$_id.title",
          modeOfPayment: "$_id.modeOfPayment",
          type: "$_id.type",
          otherIncome: 1,
        },
      },
    ]);

    const Income = await tblCustomerReceipt.aggregate([
      {
        $match: {
          operatorId: operatorId,
        },
      },
      {
        $group: {
          _id: {
            modeOfPayment: "$paymentMode",
          },
          amount: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          income: "$amount",
          modeOfPayment: "$_id.modeOfPayment",
        },
      },
    ]);

    const obj = [...otherExpense, ...otherIncome, ...Income];

    const incSubEx =
      dataFromCustomerIncome[0].income +
      dataFromOtherIncomeAndExpense[0].otherIncome -
      dataFromOtherIncomeAndExpense[0].expense;
    const bankBal = bankDetails[0].deposit - bankDetails[0].withdraw;
    const response = {
      totalIncome:
        dataFromCustomerIncome[0].income +
        dataFromOtherIncomeAndExpense[0].otherIncome,
      totalExpense: dataFromOtherIncomeAndExpense[0].expense,
      totalDeposit: bankDetails[0].deposit,
      totalWidraw: bankDetails[0].withdraw,
      inHand: incSubEx - bankBal,
      loanAmount: 0, // Change this value if applicable
      revenue: incSubEx,
    };
    res.status(200).json({
      message: "Data generated for balance sheet successfull!",
      data: response,
      allDetails: obj,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//// balance sheet ///

/// fetch paid and unpaid customers spacific month /////
router.get(
  "/getPaidCustomerDetails",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const date = req.body.date;
    // const date = new Date(req.body.date);
    let parts = date.split("/");

    // Extract the year and month
    let year = parseInt(parts[2]);
    let month = parseInt(parts[1]);
    let operatorId = req.user.userData.operatorId;
    try {
      const response = await tblCustomerReceipt.aggregate([
        {
          $match: {
            operatorId: operatorId,
            $expr: {
              $and: [
                {
                  $eq: [
                    {
                      $month: "$createdAt",
                    },
                    month,
                  ],
                },
                {
                  $eq: [
                    {
                      $year: "$createdAt",
                    },
                    year,
                  ],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "tblCustomerInfo",
            localField: "customerId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
          },
        },
        {
          $lookup: {
            from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
            localField: "userDetails.assignedBox.boxData",
            foreignField: "_id",
            as: "boxData",
          },
        },
        {
          $unwind: {
            path: "$boxData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
            localField: "userDetails.assignedBox.assignedPackage.packageData",
            foreignField: "_id",
            as: "assignedPackageData",
          },
        },
        {
          $unwind: {
            path: "$assignedPackageData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorInvoiceTypeData",
            localField: "userDetails.assignedBox.assignedPackage.invoiceTypeId",
            foreignField: "_id",
            as: "invoiceData",
          },
        },
        {
          $unwind: {
            path: "$invoiceData",
          },
        },
        {
          $set: {
            "userDetails.assignedBox": {
              $map: {
                input: "$userDetails.assignedBox",
                as: "box",
                in: {
                  $mergeObjects: [
                    "$boxData",
                    {
                      assignedPackage: {
                        $map: {
                          input: "$$box.assignedPackage",
                          as: "package",
                          in: {
                            $mergeObjects: [
                              "$assignedPackageData",
                              "$$package",
                              {
                                invoiceTypeId: "$invoiceData",
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $unwind: {
            path: "$userDetails.assignedBox",
          },
        },
        {
          $group: {
            _id: "$userDetails._id",
            userDetails: { $first: "$userDetails" },
            assignedBox: { $push: "$userDetails.assignedBox" },
            otherDetails: {
              $push: {
                amount: "$amount",
                description: "$description",
                discount: "$discount",
                paidDate: "$paidDate",
                paymentMode: "$paymentMode",
                methode: "$methode",
                status: "$status",
                paymentType: "$paymentType",
                currentDue: "$currentDue",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            otherDetails: 1,
            userDetails: {
              userId: "$_id",
              operatorId: "$userDetails.operatorId",
              operatorCustId: "$userDetails.operatorCustId",
              custName: "$userDetails.custName",
              contact: "$userDetails.contact",
              email: "$userDetails.email",
              perAddress: "$userDetails.perAddress",
              initAddress: "$userDetails.initAddress",
              area: "$userDetails.area",
              city: "$userDetails.city",
              state: "$userDetails.state",
              pin: "$userDetails.pin",
              createDate: "$userDetails.createDate",
              activationDate: "$uesrDetails.activationDate",
              houseName: "$userDetails.houseName",
              custCategory: "$userDetails.custCategory",
              gstNo: "$userDetails.gstNo",
              custType: "$userDetails.custType",
              due: "$userDetails.due",
              dueString: "$userDetails.dueString",
              discount: "$userDetails.discount",
              postPaid: "$userDetails.postPaid",
              status: "$userDetails.status",
              assignedBox: "$assignedBox",
              statusString: "$userDetails.statusString",
            },
          },
        },
      ]);
      res
        .status(200)
        .json({ message: "Data fetch successfull!", data: response });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/getUnPaidCustomerDetails",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const date = new Date(req.body.date);
    const month = date.getMonth() + 1; // add 1 because $month operator returns 1-12
    const year = date.getFullYear();
    let operatorId = req.user.userData.operatorId;
    try {
      const response = await tblCustomerInfo.aggregate([
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $lookup: {
            from: "tblCustomerReceipt",
            localField: "_id",
            foreignField: "customerId",
            as: "paidDetails",
          },
        },
        {
          $addFields: {
            unpaid: {
              $and: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: "$paidDetails",
                          as: "pd",
                          cond: {
                            $and: [
                              {
                                $eq: [
                                  {
                                    $year: "$$pd.createdAt",
                                  },
                                  year,
                                ],
                              },
                              {
                                $eq: [
                                  {
                                    $month: "$$pd.createdAt",
                                  },
                                  month,
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
        {
          $match: {
            unpaid: false,
          },
        },
        {
          $project: {
            id: 1,
            custName: 1,
            area: 1,
            contact: 1,
          },
        },
      ]);
      res
        .status(200)
        .json({ massage: "Data Fetch successfull!", data: response });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

/// fetch paid and unpaid customers spacific month /////

/// current month created user List ///

router.get(
  "/currentMonthCretedCustomers",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const currentMonthCreatedCustomers = await tblCustomerInfo.aggregate([
        {
          $addFields: {
            createDate: {
              $dateFromString: {
                dateString: "$createDate",
                format: "%d/%m/%Y",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$createDate" }, new Date().getMonth() + 1],
            },
          },
        },
      ]);
      res.status(200).json({
        message: "data fetch successfull!",
        data: currentMonthCreatedCustomers,
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

/// current month created user List ///

/// get expired package list ////

router.get(
  "/packages/expiring-soon/:days",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    let days = req.query.days;
    let targetDate = new Date();
    targetDate.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC
    targetDate.setDate(targetDate.getDate() + Number(days));
    const formatted = targetDate.toISOString().substring(0, 10);
    const parts = formatted.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    let operatorId = req.user.userData.operatorId;
    try {
      const response = await tblCustomerInfo.aggregate([
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $match: {
            "assignedBox.assignedPackage.status": 1,
            "assignedBox.status": 1,
            "assignedBox.assignedPackage.endDate": {
              $not: { $in: [null, ""] },
            },
            "assignedBox.assignedPackage.endDate": formattedDate,
          },
        },
        {
          $lookup: {
            from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
            localField: "assignedBox.boxData",
            foreignField: "_id",
            as: "boxData",
          },
        },
        {
          $unwind: {
            path: "$boxData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
            localField: "assignedBox.assignedPackage.packageData",
            foreignField: "_id",
            as: "assignedPackageData",
          },
        },
        {
          $unwind: {
            path: "$assignedPackageData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorInvoiceTypeData",
            localField: "assignedBox.assignedPackage.invoiceTypeId",
            foreignField: "_id",
            as: "invoiceData",
          },
        },
        {
          $unwind: {
            path: "$invoiceData",
          },
        },
        {
          $set: {
            assignedBox: {
              $map: {
                input: "$assignedBox",
                as: "box",
                in: {
                  $mergeObjects: [
                    "$boxData",
                    {
                      assignedPackage: {
                        $map: {
                          input: "$$box.assignedPackage",
                          as: "package",
                          in: {
                            $mergeObjects: [
                              "$assignedPackageData",
                              "$$package",
                              {
                                invoiceTypeId: "$invoiceData",
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            custName: 1,
            contact: 1,
            email: 1,
            perAddress: 1,
            initAddress: 1,
            area: 1,
            city: 1,
            state: 1,
            houseName: 1,
            assignedBox: 1,
          },
        },
      ]);
      res
        .status(200)
        .json({ message: "fetch data successfull!", data: response });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/packages/expire_before/:days",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    let days = req.params.days;
    let targetDate = new Date();
    targetDate.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC
    targetDate.setDate(targetDate.getDate() + Number(days));
    const formattedDate = targetDate;
    let operatorId = req.user.userData.operatorId;
    try {
      const response = await tblCustomerInfo.aggregate([
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $unwind: {
            path: "$assignedBox",
          },
        },
        {
          $unwind: {
            path: "$assignedBox.assignedPackage",
          },
        },
        {
          $match: {
            "assignedBox.assignedPackage.status": 1,
            "assignedBox.status": 1,
            "assignedBox.assignedPackage.endDate": {
              $not: {
                $in: [null, ""],
              },
            },
          },
        },
        {
          $addFields: {
            "assignedBox.assignedPackage.end_Date": {
              $dateFromParts: {
                year: {
                  $toInt: {
                    $substr: ["$assignedBox.assignedPackage.endDate", 6, 4],
                  },
                },
                month: {
                  $toInt: {
                    $substr: ["$assignedBox.assignedPackage.endDate", 3, 2],
                  },
                },
                day: {
                  $toInt: {
                    $substr: ["$assignedBox.assignedPackage.endDate", 0, 2],
                  },
                },
                hour: 0,
                minute: 0,
                second: 0,
                timezone: "UTC",
              },
            },
          },
        },
        {
          $match: {
            "assignedBox.assignedPackage.end_Date": {
              $lte: formattedDate,
              $gt: new Date(),
            },
          },
        },
        {
          $lookup: {
            from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
            localField: "assignedBox.boxData",
            foreignField: "_id",
            as: "boxData",
          },
        },
        {
          $unwind: {
            path: "$boxData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
            localField: "assignedBox.assignedPackage.packageData",
            foreignField: "_id",
            as: "assignedPackageData",
          },
        },
        {
          $unwind: {
            path: "$assignedPackageData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorInvoiceTypeData",
            localField: "assignedBox.assignedPackage.invoiceTypeId",
            foreignField: "_id",
            as: "invoiceData",
          },
        },
        {
          $unwind: {
            path: "$invoiceData",
          },
        },
        {
          $set: {
            assignedBox: [
              {
                $mergeObjects: [
                  "$boxData",
                  {
                    assignedPackage: [
                      {
                        $mergeObjects: [
                          "$assignedPackageData",
                          "$assignedBox.assignedPackage",
                          {
                            invoiceTypeId: "$invoiceData",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            custName: 1,
            contact: 1,
            email: 1,
            perAddress: 1,
            initAddress: 1,
            area: 1,
            city: 1,
            state: 1,
            houseName: 1,
            assignedBox: 1,
          },
        },
      ]);
      res
        .status(200)
        .json({ message: "fetch data successfull!", data: response });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

/// get expired package list ////

///////
// router.put(
//   "/updatePersonalDetailsInOperatorInfo/:id",
//   AuthMiddleware.verifyToken,
//   async (req, res) => {
//     const operatorId = req.user.userData.operatorId;
//     const { details } = req.body;

//     try {
//       const updatedOperatorInfo = await tblOperatorInfo.findByIdAndUpdate(
//         req.params.id,
//         { $set: details },
//         { new: true }
//       );
//       if (req.body.password) {
//         const updatedLogin = await tblLogin.findOneAndUpdate(
//           { loginId: operatorId },
//           { $set: req.body.password },
//           { new: true }
//         );
//       }
//     } catch (error) {}
//   }
// );
router.put(
  "/updatePersonalDetailsInOperatorInfo/:id",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const operatorId = req.user.userData.operatorId;
    const { details, password } = req.body;

    try {
      const updatedOperatorInfo = await tblOperatorInfo.findByIdAndUpdate(
        req.params.id,
        { $set: details },
        { new: true }
      );

      if (password) {
        const updatedLogin = await tblLogin.findOneAndUpdate(
          { loginId: operatorId },
          { $set: { password } },
          { new: true }
        );
      }

      res.status(200).json({ success: true, message: "Update successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Update failed" });
    }
  }
);

///////

/// get area ways customerReceipt details  ///

router.get(
  "/customerReceipt/filterWithArea",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const area = req.query.area;
    let operatorId = req.user.userData.operatorId;
    try {
      const response = await tblCustomerReceipt.aggregate([
        {
          $match: {
            operatorId: operatorId,
          },
        },
        {
          $lookup: {
            from: "tblCustomerInfo",
            localField: "customerId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
          },
        },
        {
          $match: {
            "userDetails.area": area,
          },
        },
        {
          $lookup: {
            from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
            localField: "userDetails.assignedBox.boxData",
            foreignField: "_id",
            as: "boxData",
          },
        },
        {
          $unwind: {
            path: "$boxData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
            localField: "userDetails.assignedBox.assignedPackage.packageData",
            foreignField: "_id",
            as: "assignedPackageData",
          },
        },
        {
          $unwind: {
            path: "$assignedPackageData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorInvoiceTypeData",
            localField: "userDetails.assignedBox.assignedPackage.invoiceTypeId",
            foreignField: "_id",
            as: "invoiceData",
          },
        },
        {
          $unwind: {
            path: "$invoiceData",
          },
        },
        {
          $set: {
            "userDetails.assignedBox": {
              $map: {
                input: "$userDetails.assignedBox",
                as: "box",
                in: {
                  $mergeObjects: [
                    "$boxData",
                    {
                      assignedPackage: {
                        $map: {
                          input: "$$box.assignedPackage",
                          as: "package",
                          in: {
                            $mergeObjects: [
                              "$assignedPackageData",
                              "$$package",
                              {
                                invoiceTypeId: "$invoiceData",
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            boxData: 0,
            assignedPackageData: 0,
            invoiceData: 0,
          },
        },
      ]);
      res
        .status(200)
        .json({ message: "fetch data successfull!", data: response });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

/// get area ways customerReceipt details  ///

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

router.post(
  "/getConnectionInvoiceDetails",
  AuthMiddleware.verifyToken,
  async (request, response) => {
    getConnectionInvoiceDetails(request, request.user.userData.operatorId).then(
      (data) => {
        responseArray = {
          status: data.length === 0 ? false : true,
          message:
            data.length === 0
              ? "Authentication failed !"
              : "Data fetched successfully !",
          response: {
            resultInvoice: data,
          },
        };
        response.send(responseArray);
      }
    );
  }
);
function getConnectionInvoiceDetails(request, response, operatorId) {
  return new Promise(async (resolve, reject) => {
    var post = request.body;

    tblCustomerReceipt
      .find({ customerId: mongoose.Types.ObjectId(post.connectionId) })
      .exec()
      .then((data) => {
        resolve(data);
      });
  });
}

router.post(
  "/operator/reports/collections",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    var post = req.body;
    let perPage;
    let page;
    const pin = post.moreFilter;
    let match = {};
    perPage = parseInt(post.rowsPerPage);
    page = Math.max(0, post.page);
    if (post.range != "undefined") {
      let split = post.range.split("-");
      startDate = split[0].replace(/\s/g, "");
      endDate = split[1].replace(/\s/g, "");
    }
    let operatorId = req.user.userData.operatorId;
    match.operatorId = operatorId;
    switch (post.filter) {
      case "Employee":
        match.collectionStaff = pin;
        break;
      case "Cash":
        match.paymentMode = post.filter;
        break;
      case "Online":
        match.paymentMode = post.filter;
        break;
      case "Discount":
        match.paymentType = post.filter;
        break;
      default:
        break;
    }
    try {
      const total = await tblCustomerReceipt.aggregate([
        {
          $match: match,
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: { $toString: "$createdAt" },
                      },
                    },
                    {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            { $substr: [startDate, 6, 4] },
                            "-", //Extract year
                            { $substr: [startDate, 3, 2] },
                            "-", //Extract month
                            { $substr: [startDate, 0, 2] }, //Extract day
                            "T00:00:00Z",
                          ],
                        },
                      },
                    },
                  ],
                },
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: { $toString: "$createdAt" },
                      },
                    },
                    {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            { $substr: [endDate, 6, 4] },
                            "-", //Extract year
                            { $substr: [endDate, 3, 2] },
                            "-", //Extract month
                            { $substr: [endDate, 0, 2] }, //Extract day
                            "T00:00:00Z",
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            sum_val: { $sum: "$amount" },
            balance_val: { $sum: "$currentDue" },
          },
        },
      ]);
      // const count = await tblCustomerReceipt.aggregate([
      //   {
      //     $match: match,
      //   },
      //   {
      //     $match: {
      //       $expr: {
      //         $and: [
      //           {
      //             $gte: [
      //               {
      //                 $dateFromString: {
      //                   dateString: { $toString: "$createdAt" },
      //                 },
      //               },
      //               {
      //                 $dateFromString: {
      //                   dateString: {
      //                     $concat: [
      //                       { $substr: [startDate, 6, 4] },
      //                       "-", //Extract year
      //                       { $substr: [startDate, 3, 2] },
      //                       "-", //Extract month
      //                       { $substr: [startDate, 0, 2] }, //Extract day
      //                       "T00:00:00Z",
      //                     ],
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //           {
      //             $lte: [
      //               {
      //                 $dateFromString: {
      //                   dateString: { $toString: "$createdAt" },
      //                 },
      //               },
      //               {
      //                 $dateFromString: {
      //                   dateString: {
      //                     $concat: [
      //                       { $substr: [endDate, 6, 4] },
      //                       "-", //Extract year
      //                       { $substr: [endDate, 3, 2] },
      //                       "-", //Extract month
      //                       { $substr: [endDate, 0, 2] }, //Extract day
      //                       "T00:00:00Z",
      //                     ],
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //       },
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblCustomerInfo",
      //       localField: "customerId",
      //       foreignField: "_id",
      //       as: "userDetails",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$userDetails",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
      //       localField: "userDetails.assignedBox.boxData",
      //       foreignField: "_id",
      //       as: "boxData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$boxData",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
      //       localField: "userDetails.assignedBox.assignedPackage.packageData",
      //       foreignField: "_id",
      //       as: "assignedPackageData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$assignedPackageData",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorInvoiceTypeData",
      //       localField: "userDetails.assignedBox.assignedPackage.invoiceTypeId",
      //       foreignField: "_id",
      //       as: "invoiceData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$invoiceData",
      //     },
      //   },
      //   {
      //     $set: {
      //       "userDetails.assignedBox": {
      //         $map: {
      //           input: "$userDetails.assignedBox",
      //           as: "box",
      //           in: {
      //             $mergeObjects: [
      //               "$boxData",
      //               {
      //                 assignedPackage: {
      //                   $map: {
      //                     input: "$$box.assignedPackage",
      //                     as: "package",
      //                     in: {
      //                       $mergeObjects: [
      //                         "$assignedPackageData",
      //                         "$$package",
      //                         {
      //                           invoiceTypeId: "$invoiceData",
      //                         },
      //                       ],
      //                     },
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $count: "userDetails",
      //   },
      // ]);
      // const response = await tblCustomerReceipt.aggregate([
      //   {
      //     $match: match,
      //   },
      //   {
      //     $match: {
      //       $expr: {
      //         $and: [
      //           {
      //             $gte: [
      //               {
      //                 $dateFromString: {
      //                   dateString: { $toString: "$createdAt" },
      //                 },
      //               },
      //               {
      //                 $dateFromString: {
      //                   dateString: {
      //                     $concat: [
      //                       { $substr: [startDate, 6, 4] },
      //                       "-", //Extract year
      //                       { $substr: [startDate, 3, 2] },
      //                       "-", //Extract month
      //                       { $substr: [startDate, 0, 2] }, //Extract day
      //                       "T00:00:00Z",
      //                     ],
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //           {
      //             $lte: [
      //               {
      //                 $dateFromString: {
      //                   dateString: { $toString: "$createdAt" },
      //                 },
      //               },
      //               {
      //                 $dateFromString: {
      //                   dateString: {
      //                     $concat: [
      //                       { $substr: [endDate, 6, 4] },
      //                       "-", //Extract year
      //                       { $substr: [endDate, 3, 2] },
      //                       "-", //Extract month
      //                       { $substr: [endDate, 0, 2] }, //Extract day
      //                       "T00:00:00Z",
      //                     ],
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //       },
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblCustomerInfo",
      //       localField: "customerId",
      //       foreignField: "_id",
      //       as: "userDetails",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$userDetails",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
      //       localField: "userDetails.assignedBox.boxData",
      //       foreignField: "_id",
      //       as: "boxData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$boxData",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
      //       localField: "userDetails.assignedBox.assignedPackage.packageData",
      //       foreignField: "_id",
      //       as: "assignedPackageData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$assignedPackageData",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "tblOperatorInvoiceTypeData",
      //       localField: "userDetails.assignedBox.assignedPackage.invoiceTypeId",
      //       foreignField: "_id",
      //       as: "invoiceData",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$invoiceData",
      //     },
      //   },
      //   {
      //     $set: {
      //       "userDetails.assignedBox": {
      //         $map: {
      //           input: "$userDetails.assignedBox",
      //           as: "box",
      //           in: {
      //             $mergeObjects: [
      //               "$boxData",
      //               {
      //                 assignedPackage: {
      //                   $map: {
      //                     input: "$$box.assignedPackage",
      //                     as: "package",
      //                     in: {
      //                       $mergeObjects: [
      //                         "$assignedPackageData",
      //                         "$$package",
      //                         {
      //                           invoiceTypeId: "$invoiceData",
      //                         },
      //                       ],
      //                     },
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       boxData: 0,
      //       assignedPackageData: 0,
      //       invoiceData: 0,
      //       customerId: 0,
      //       "userDetails.activationDeactivationHistory": 0,
      //       "userDetails.sortId": 0,
      //     },
      //   },
      //   {
      //     $skip: perPage * page - perPage,
      //   },
      //   {
      //     $limit: perPage,
      //   },
      // ]);
      const response = await tblCustomerReceipt.aggregate([
        {
          $match: match,
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: { $toString: "$createdAt" },
                      },
                    },
                    {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            { $substr: [startDate, 6, 4] },
                            "-", //Extract year
                            { $substr: [startDate, 3, 2] },
                            "-", //Extract month
                            { $substr: [startDate, 0, 2] }, //Extract day
                            "T00:00:00Z",
                          ],
                        },
                      },
                    },
                  ],
                },
                {
                  $lte: [
                    {
                      $dateFromString: {
                        dateString: { $toString: "$createdAt" },
                      },
                    },
                    {
                      $dateFromString: {
                        dateString: {
                          $concat: [
                            { $substr: [endDate, 6, 4] },
                            "-", //Extract year
                            { $substr: [endDate, 3, 2] },
                            "-", //Extract month
                            { $substr: [endDate, 0, 2] }, //Extract day
                            "T23:59:59Z", // Use the end of the day
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $match: {
            paymentType: "Payment",
          },
        },
        {
          $lookup: {
            from: "tblCustomerInfo",
            localField: "customerId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
          },
        },
        {
          $lookup: {
            from: "tblOperatorDevice",
            localField: "userDetails.assignedBox.boxData",
            foreignField: "_id",
            as: "boxData",
          },
        },
        {
          $unwind: {
            path: "$boxData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorPackages",
            localField: "userDetails.assignedBox.assignedPackage.packageData",
            foreignField: "_id",
            as: "assignedPackageData",
          },
        },
        {
          $unwind: {
            path: "$assignedPackageData",
          },
        },
        {
          $lookup: {
            from: "tblOperatorInvoiceTypeData",
            localField: "userDetails.assignedBox.assignedPackage.invoiceTypeId",
            foreignField: "_id",
            as: "invoiceData",
          },
        },
        {
          $unwind: {
            path: "$invoiceData",
          },
        },
        {
          $set: {
            "userDetails.assignedBox": {
              $map: {
                input: "$userDetails.assignedBox",
                as: "box",
                in: {
                  $mergeObjects: [
                    "$boxData",
                    {
                      assignedPackage: {
                        $map: {
                          input: "$$box.assignedPackage",
                          as: "package",
                          in: {
                            $mergeObjects: [
                              "$assignedPackageData",
                              "$$package",
                              {
                                invoiceTypeId: "$invoiceData",
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            boxData: 0,
            assignedPackageData: 0,
            invoiceData: 0,
            customerId: 0,
            "userDetails.activationDeactivationHistory": 0,
            "userDetails.sortId": 0,
          },
        },
        {
          $group: {
            _id: "$_id",
            userDetails: {
              $mergeObjects: "$userDetails",
            },
            assignedPackages: {
              $push: {
                $ifNull: ["$userDetails.assignedBox.assignedPackage", []],
              },
            },
          },
        },
        {
          $facet: {
            totalCount: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
            data: [
              {
                $skip: perPage * page - perPage,
              },
              {
                $limit: perPage,
              },
            ],
          },
        },
      ]);
      const data = response[0]?.data;
      const totalCount = response[0]?.totalCount[0]?.count;

      let responseArray = {
        status: true,
        message:
          response.length > 0 ? "Data fetch successfull!" : "No data found!",
        count: totalCount,
        sum: total[0]?.sum_val,
        balance: total[0]?.balance_val,
        response: data,
      };

      res.status(200).json(responseArray);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/collection-reports",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const operatorId = req.user.userData.operatorId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    try {
      const areas = await tblOperatorInfo.findOne(
        { operatorId: operatorId },
        { AreaData: 1 }
      );
      const areaReports = [];
      for (const area of areas.AreaData) {
        const totalCollection = await tblCustomerReceipt.aggregate([
          {
            $match: {
              operatorId: operatorId,
              createdAt: {
                $gte: new Date(currentYear, currentMonth - 1, 1),
                $lt: new Date(currentYear, currentMonth, 1),
              },
            },
          },
          {
            $lookup: {
              from: "tblCustomerInfo",
              localField: "customerId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $match: {
              "result.area": area,
            },
          },
          {
            $unwind: {
              path: "$result",
            },
          },
          {
            $group: {
              _id: null,
              totalCollection: {
                $sum: "$amount",
              },
              totalDue: {
                $sum: "$result.due",
              },
            },
          },
        ]);
        const balance =
          totalCollection[0]?.totalDue - totalCollection[0]?.totalCollection ||
          0;
        const areaReport = {
          area: area,
          TotalDue: totalCollection[0]?.totalDue || 0,
          TotalCollection: totalCollection[0]?.totalCollection || 0,
          Balance: balance,
        };
        areaReports.push(areaReport);
      }
      res.json({ success: true, data: areaReports });
    } catch (error) {
      res.status(500).json({ success: false, error: "An error occurred" });
    }
  }
);

router.get("/top-packages", AuthMiddleware.verifyToken, async (req, res) => {
  const operatorId = req.user.userData.operatorId;
  try {
    const pipeline = [
      {
        $match: {
          operatorId: operatorId,
        },
      },
      {
        $unwind: "$assignedBox",
      },
      {
        $unwind: "$assignedBox.assignedPackage",
      },
      {
        $lookup: {
          from: "tblOperatorPackages",
          localField: "assignedBox.assignedPackage.packageData",
          foreignField: "_id",
          as: "packageData",
        },
      },
      {
        $unwind: "$packageData",
      },
      {
        $match: {
          "packageData.packageType": "MAIN",
        },
      },
      {
        $group: {
          _id: "$assignedBox.assignedPackage.packageData",
          totalConnections: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "tblOperatorPackages",
          localField: "_id",
          foreignField: "_id",
          as: "packageData",
        },
      },
      {
        $unwind: "$packageData",
      },
      {
        $project: {
          _id: 0,
          packageName: "$packageData.packageName",
          totalConnections: 1,
        },
      },
      {
        $sort: {
          totalConnections: -1,
        },
      },
    ];

    const topPackages = await tblCustomerInfo.aggregate(pipeline).exec();
    res.json({ success: true, data: topPackages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred" });
  }
});

router.get(
  "/current-month-collection-vs-expenses",
  AuthMiddleware.verifyToken,
  async (req, res) => {
    const operatorId = req.user.userData.operatorId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    try {
      const collectionData = await tblCustomerReceipt.aggregate([
        {
          $match: {
            operatorId: operatorId,
            createdAt: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lt: new Date(currentYear, currentMonth, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalCollection: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const expensesData = await tblOtherExpenseAndIncome.aggregate([
        {
          $match: {
            operatorId: operatorId,
            type: "Expense",
            createdAt: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lt: new Date(currentYear, currentMonth, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const response = {
        success: true,
        data: {
          collection: collectionData[0]?.totalCollection || 0,
          expenses: expensesData[0]?.totalExpense || 0,
        },
      };
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "An error occurred" });
    }
  }
);

function calculatePercentageChange(previousValue, currentValue) {
  if (previousValue === 0 && currentValue === 0) {
    return 0; // Both incomes are zero, percentage change is zero
  } else if (previousValue === 0) {
    return 100.0; // Last month income is zero, consider it as a 100% increase
  } else if (currentValue === 0) {
    return -100.0; // This month income is zero, consider it as a 100% decrease
  }

  const percentageChange =
    ((currentValue - previousValue) / previousValue) * 100;
  return percentageChange;
}

router.get("/summary-reports", AuthMiddleware.verifyToken, async (req, res) => {
  const operatorId = req.user.userData.operatorId;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  // Calculate the previous month
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  try {
    // Get total previous balance (Total Due - Total Invoice)
    const totalDue = await tblCustomerInfo.aggregate([
      {
        $match: {
          operatorId: operatorId,
          updatedAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDue: {
            $sum: "$due",
          },
        },
      },
    ]);

    const totalInvoice = await tblCustomerMonthlyStatement.aggregate([
      {
        $addFields: {
          createdDate: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$createdDate", 6, 4] }, // Extract year
                  "-",
                  { $substr: ["$createdDate", 3, 2] }, // Extract month
                  "-",
                  { $substr: ["$createdDate", 0, 2] }, // Extract day
                ],
              },
              format: "%Y-%m-%d",
            },
          },
        },
      },
      {
        $match: {
          operatorId: operatorId,
          transactionType: "Invoice",
          createdDate: {
            $gte: new Date(currentYear, currentMonth - 1, 1), // Start of current month
            $lt: new Date(currentYear, currentMonth, 1), // Start of next month
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: "$credit",
          },
        },
      },
    ]);

    const totalCollection = await tblCustomerReceipt.aggregate([
      {
        $match: {
          operatorId: operatorId,
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalExpense = await tblOtherExpenseAndIncome.aggregate([
      {
        $match: {
          operatorId: operatorId,
          type: "Expense",
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);
    const previousDue =
      totalDue[0]?.totalDue - totalInvoice[0]?.totalCredit || 0;
    const invoiceCredit = totalInvoice[0]?.totalCredit || 0;
    const collection = totalCollection[0]?.totalAmount || 0;
    const balanceAmount = totalDue[0]?.totalDue - collection || 0;
    const expense = totalExpense[0]?.totalAmount || 0;

    // Calculate variation percentage since last month
    const previousTotalDue = await tblCustomerInfo.aggregate([
      {
        $match: {
          operatorId: operatorId,
          updatedAt: {
            $gte: new Date(currentYear, previousMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDue: {
            $sum: "$due",
          },
        },
      },
    ]);
    const previousMonthCollection = await tblCustomerReceipt.aggregate([
      {
        $match: {
          operatorId: operatorId,
          createdAt: {
            $gte: new Date(currentYear, previousMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const previousMonthInvoice = await tblCustomerMonthlyStatement.aggregate([
      {
        $addFields: {
          createdDate: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $substr: ["$createdDate", 6, 4] }, // Extract year
                  "-",
                  { $substr: ["$createdDate", 3, 2] }, // Extract month
                  "-",
                  { $substr: ["$createdDate", 0, 2] }, // Extract day
                ],
              },
              format: "%Y-%m-%d",
            },
          },
        },
      },
      {
        $match: {
          operatorId: operatorId,
          transactionType: "Invoice",
          createdDate: {
            $gte: new Date(currentYear, previousMonth - 1, 1), // Start of current month
            $lt: new Date(currentYear, currentMonth - 1, 1), // Start of next month
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: "$credit",
          },
        },
      },
    ]);

    console.log(previousMonthInvoice, "previousMonthInvoice");

    const previousMonthExpense = await tblOtherExpenseAndIncome.aggregate([
      {
        $match: {
          operatorId: operatorId,
          type: "Expense",
          createdAt: {
            $gte: new Date(currentYear, previousMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);
    const previousMonthTotalDue =
      previousTotalDue[0]?.totalDue - previousMonthInvoice[0]?.count || 0;
    const previousMonthCollectionAmount =
      previousMonthCollection[0]?.totalAmount || 0;
    const previousMonthInvoiceCount = previousMonthInvoice[0]?.totalCredit || 0;
    const previousMonthBalanceAmount =
      previousMonthTotalDue - previousMonthCollectionAmount || 0;
    const previousMonthExpenseAmount =
      previousMonthExpense[0]?.totalAmount || 0;

    const sinceLastMonthDue = calculatePercentageChange(
      previousMonthTotalDue,
      previousDue
    );
    const sinceLastMonthInvoice = calculatePercentageChange(
      previousMonthInvoiceCount,
      invoiceCredit
    );
    const sinceLastMonthCollection = calculatePercentageChange(
      previousMonthCollectionAmount,
      collection
    );
    const sinceLastMonthBalanceAmount = calculatePercentageChange(
      previousMonthBalanceAmount,
      balanceAmount
    );
    const sinceLastMonthExpense = calculatePercentageChange(
      previousMonthExpenseAmount,
      expense
    );

    const summaryReports = [
      {
        "Previous Balance": previousDue,
        SinceLastMonth: sinceLastMonthDue,
      },
      {
        "Total Invoice": invoiceCredit,
        SinceLastMonth: sinceLastMonthInvoice,
      },
      {
        "Total Collection": collection,
        SinceLastMonth: sinceLastMonthCollection,
      },
      {
        "Balance Amount": balanceAmount,
        SinceLastMonth: sinceLastMonthBalanceAmount,
      },
      {
        "Total Expense": expense,
        SinceLastMonth: sinceLastMonthExpense,
      },
    ];

    const response = {
      success: true,
      data: summaryReports,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred" });
  }
});

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
              match.operatorCustIdLower = {
                $regex: `${val.Contains.toLowerCase()}`,
                $options: "i",
              };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.operatorCustIdLower = val.Equals.toLowerCase();
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.operatorCustIdLower = {
                $regex: `^${val["Starts with"].toLowerCase()}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.operatorCustIdLower = {
                $regex: `${val["Ends with"].toLowerCase()}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.operatorCustIdLower = {
                $gt: val["Greater than"].toLowerCase(),
              };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.operatorCustIdLower = {
                $gte: val["Greater than or equal to"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.operatorCustIdLower = {
                $lt: val["Less than"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.operatorCustIdLower = {
                $lte: val["Less than or equal to"].toLowerCase(),
              };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("cusid_field")) {
        post.filter.cusid_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.autoCustIdString = {
                $regex: `${val.Contains}`,
                $options: "i",
              };
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
              match.custNameLower = {
                $regex: `${val.Contains.toLowerCase()}`,
                $options: "i",
              };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.custNameLower = val.Equals.toLowerCase();
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.custNameLower = {
                $regex: `^${val["Starts with"].toLowerCase()}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.custNameLower = {
                $regex: `${val["Ends with"].toLowerCase()}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.custNameLower = { $gt: val["Greater than"].toLowerCase() };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.custNameLower = {
                $gte: val["Greater than or equal to"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.custNameLower = { $lt: val["Less than"].toLowerCase() };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.custNameLower = {
                $lte: val["Less than or equal to"].toLowerCase(),
              };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("contact_field")) {
        post.filter.contact_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.contact = { $regex: `${val.Contains}`, $options: "i" };
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
              match.areaLower = {
                $regex: `${val.Contains.toLowerCase()}`,
                $options: "i",
              };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.areaLower = val.Equals.toLowerCase();
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.areaLower = {
                $regex: `^${val["Starts with"].toLowerCase()}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.areaLower = {
                $regex: `${val["Ends with"].toLowerCase()}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.areaLower = { $gt: val["Greater than"].toLowerCase() };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.areaLower = {
                $gte: val["Greater than or equal to"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.areaLower = { $lt: val["Less than"].toLowerCase() };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.areaLower = {
                $lte: val["Less than or equal to"].toLowerCase(),
              };
            }
          }
        });
      }
      if (post.filter.hasOwnProperty("house_field")) {
        post.filter.house_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.houseNameLower = {
                $regex: `${val.Contains.toLowerCase()}`,
                $options: "i",
              };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.houseNameLower = val.Equals.toLowerCase();
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.houseNameLower = {
                $regex: `^${val["Starts with"].toLowerCase()}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.houseNameLower = {
                $regex: `${val["Ends with"].toLowerCase()}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.houseNameLower = { $gt: val["Greater than"].toLowerCase() };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.houseNameLower = {
                $gte: val["Greater than or equal to"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.houseNameLower = { $lt: val["Less than"].toLowerCase() };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.houseNameLower = {
                $lte: val["Less than or equal to"].toLowerCase(),
              };
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
                  $elemMatch: {
                    boxData: new mongoose.Types.ObjectId(val.Equals),
                  },
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
      if (post.filter.hasOwnProperty("type_field")) {
        var or = [];
        post.filter.type_field.map((val) => {
          if (typeof val.Contains != "undefined") {
            if (val.Contains != "All") {
              match.custTypeLower = {
                $regex: `${val.Contains.toLowerCase()}`,
                $options: "i",
              };
            }
          }
          if (typeof val.Equals != "undefined") {
            if (val.Equals != "All") {
              match.custTypeLower = val.Equals.toLowerCase();
            }
          }
          if (typeof val["Starts with"] != "undefined") {
            if (val["Starts with"] != "All") {
              match.custTypeLower = {
                $regex: `^${val["Starts with"].toLowerCase()}`,
                $options: "m",
              };
            }
          }
          if (typeof val["Ends with"] != "undefined") {
            if (val["Ends with"] != "All") {
              match.custTypeLower = {
                $regex: `${val["Ends with"].toLowerCase()}$`,
                $options: "m",
              };
            }
          }
          if (typeof val["Greater than"] != "undefined") {
            if (val["Greater than"] != "All") {
              match.custTypeLower = { $gt: val["Greater than"].toLowerCase() };
            }
          }
          if (typeof val["Greater than or equal to"] != "undefined") {
            if (val["Greater than or equal to"] != "All") {
              match.custTypeLower = {
                $gte: val["Greater than or equal to"].toLowerCase(),
              };
            }
          }
          if (typeof val["Less than"] != "undefined") {
            if (val["Less than"] != "All") {
              match.custTypeLower = { $lt: val["Less than"].toLowerCase() };
            }
          }
          if (typeof val["Less than or equal to"] != "undefined") {
            if (val["Less than or equal to"] != "All") {
              match.custTypeLower = {
                $lte: val["Less than or equal to"].toLowerCase(),
              };
            }
          }
        });
      }
    }
    match.operatorId = operatorId;
    if (!match.hasOwnProperty("status")) {
      match.status = { $ne: 3 };
    }

    var count = await getCount(match, and);

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
        // console.log(boxDat.length);
        response.send(responseArray);
      }
    );
  }
);
function getCount(match, and) {
  return new Promise(async (resolve, reject) => {
    let countMap = await TblCustomerInfo.aggregate([
      {
        $addFields: {
          custNameLower: { $toLower: "$custName" },
          operatorCustIdLower: { $toLower: "$operatorCustId" },
          contactLower: { $toLower: "$contact" },
          areaLower: { $toLower: "$area" },
          houseNameLower: { $toLower: "$houseName" },
          custTypeLower: { $toLower: "$custType" },
        },
      },
      {
        $match: match,
      },
      {
        $match: and,
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
    let cust = await tblCustomerInfo.aggregate([
      {
        $addFields: {
          custNameLower: { $toLower: "$custName" },
          operatorCustIdLower: { $toLower: "$operatorCustId" },
          contactLower: { $toLower: "$contact" },
          areaLower: { $toLower: "$area" },
          houseNameLower: { $toLower: "$houseName" },
          custTypeLower: { $toLower: "$custType" },
          dueString: { $toLower: "$due" },
        },
      },
      {
        $match: match,
      },
      {
        $match: and,
      },
      {
        $unwind: {
          path: "$assignedBox",
        },
      },
      {
        $unwind: {
          path: "$assignedBox.assignedPackage",
        },
      },
      {
        $lookup: {
          from: "tblOperatorDevice", // Replace "packages" with the actual name of your collection
          localField: "assignedBox.boxData",
          foreignField: "_id",
          as: "boxData",
        },
      },
      {
        $unwind: {
          path: "$boxData",
        },
      },
      {
        $lookup: {
          from: "tblOperatorPackages", // Replace "packages" with the actual name of your collection
          localField: "assignedBox.assignedPackage.packageData",
          foreignField: "_id",
          as: "assignedPackageData",
        },
      },
      {
        $unwind: {
          path: "$assignedPackageData",
        },
      },
      {
        $lookup: {
          from: "tblOperatorInvoiceTypeData",
          localField: "assignedBox.assignedPackage.invoiceTypeId",
          foreignField: "_id",
          as: "invoiceData",
        },
      },
      {
        $unwind: {
          path: "$invoiceData",
        },
      },
      {
        $set: {
          assignedBox: [
            {
              $mergeObjects: [
                "$boxData",
                {
                  assignedPackage: [
                    {
                      $mergeObjects: [
                        "$assignedPackageData",
                        "$assignedBox.assignedPackage",
                        {
                          invoiceTypeId: "$invoiceData",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        $unwind: "$assignedBox", // Unwind the "assignedBox" array
      },
      {
        $group: {
          _id: "$_id",
          operatorId: { $first: "$operatorId" },
          operatorCustId: { $first: "$operatorCustId" },
          custName: { $first: "$custName" },
          contact: { $first: "$contact" },
          email: { $first: "$email" },
          perAddress: { $first: "$perAddress" },
          initAddress: { $first: "$initAddress" },
          area: { $first: "$area" },
          city: { $first: "$city" },
          state: { $first: "$state" },
          pin: { $first: "$pin" },
          createDate: { $first: "$createDate" },
          activationDate: { $first: "$activationDate" },
          houseName: { $first: "$houseName" },
          custCategory: { $first: "$custCategory" },
          custType: { $first: "$custType" },
          due: { $first: "$due" },
          dueString: { $first: "$dueString" },
          discount: { $first: "$discount" },
          postPaid: { $first: "$postPaid" },
          status: { $first: "$status" },
          statusString: { $first: "$statusString" },
          sortId: { $first: "$sortId" },
          autoCustId: { $first: "$autoCustId" },
          autoCustIdString: { $first: "$autoCustIdString" },
          // Add other fields you want to preserve from the original document

          assignedBox: { $push: "$assignedBox" }, // Merge the "assignedBox" objects into a single array
        },
      },
      { $sort: { operatorCustId: 1 } },
      {
        $project: {
          activationDeactivationHistory: 0,
        },
      },

      {
        $skip: perPage * page - perPage,
      },
      {
        $limit: perPage,
      },
    ]);

    const result = [];
    const groupedData = {};

    for (const obj of cust) {
      const assignedBox = obj.assignedBox;
      const newObj = { ...obj }; // Copy the object and preserve other fields

      newObj.assignedBox = [];

      for (const box of assignedBox) {
        const assignedPackage = box.assignedPackage;
        const assignedBoxId = box._id;

        if (!groupedData[assignedBoxId]) {
          groupedData[assignedBoxId] = {
            ...box,
            assignedPackage: [],
          };
          newObj.assignedBox.push(groupedData[assignedBoxId]);
        }

        groupedData[assignedBoxId].assignedPackage.push(...assignedPackage);
      }

      result.push(newObj);
    }

    resolve(result);
  });
}

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
