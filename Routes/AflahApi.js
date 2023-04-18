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
global.constant = require('../Global');
const tblOperatorDevice = require('../Model/OperatorDevices')
const tblOperatorPackages = require('../Model/OperatorPackages');
const tblOperatorMso = require("../Model/OperatorMso");
const { resolve } = require("path");
const { rejects } = require("assert");
router.post("/", async (request, response) => {
  await authentication(request, response);


});


module.exports = router;