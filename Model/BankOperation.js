const mongoose = require("mongoose");
const bankOperation = mongoose.Schema(
  {
    operatorId: { type: String, required: true, index: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    IFSC: { type: String, required: true },
    status: { type: Number, required: true },
    transaction: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        transactionType: { type: String, required: true },
        amount: { type: Number, require: true },
        dateOfTransaction: { type: String, required: true },
        createdBy: { type: String, required: true },
        status: { type: Number, required: true },
      },
    ],
  },
  { timeStamps: true }
);
const tblBankOperation = mongoose.model(
  "tblBankOperation",
  bankOperation,
  "tblBankOperation"
);
module.exports = tblBankOperation;
