const mongoose = require("mongoose");

const counter = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: String,
    reference_value: {
      operatorId: String,
    },
    seq: Number,
  },
  { versionKey: false }
);
const counters = mongoose.model("counters", counter, "counters");
module.exports = counters;
