const mongoose = require("mongoose");
const otherExpense = mongoose.Schema(
  {
    opratorId: { type: String, required: true, index: true },
    expenseTitle: { type: String, required: true },
    subTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    modeOfPayment: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    referenceNumber: { type: String },
    depositDate: { type: String, required: true },
    status: { type: Number, required: true },
  },
  { timestamps: true }
);
const tblOtherExpense = mongoose.model(
  "tblOtherExpense",
  otherExpense,
  "tblOtherExpense"
);
module.exports = tblOtherExpense;
