const mongoose = require("mongoose");
const otherExpenseAndIncome = mongoose.Schema(
  {
    opratorId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    type: { type: String, required: true},
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
const tblOtherExpenseAndIncome = mongoose.model(
  "tblOtherExpenseAndIncome",
  otherExpenseAndIncome,
  "tblOtherExpenseAndIncome"
);
module.exports = tblOtherExpenseAndIncome;
