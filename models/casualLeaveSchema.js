const db = require("mongoose");

const schema = new db.Schema(
  {
    empId: {
      type: String,
      required: true,
    },
    opBalance: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    totalEligibility: {
      type: Number,
      default: 0,
    },
    availed: {
      type: Number,
      default: 0,
    },
    LOP: {
      type: Number,
      default: 0,
    },
    leaveLapsed: {
      type: Number,
      default: 0,
    },
    leaveEncashed: {
      type: Number,
      default: 0,
    },
    closingBalance: {
      type: Number,
      default: 0,
    },
    carryForward: {
      type: Number,
      default: 0,
    },
    available: {
      type: Object,
      default: {
          "01": 1,
          "02": 1,
          "03": 1,
          "04": 1,
          "05": 1,
          "06": 1,
          "07": 1,
          "08": 1,
          "09": 1,
          "10": 1,
          "11": 1,
          "12": 1
      }
    }
  },
  {
    timestamps: true,
  }
);

const CasualLeave = db.model("casualLeave", schema);
module.exports = { CasualLeave };
