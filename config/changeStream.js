const { EmpModel } = require("../models/employeeSchema");
const { CasualLeave } = require("../models/casualLeaveSchema");
const { PrivelageLeave } = require("../models/privelageLeaveSchema");
const { PaternityLeave } = require("../models/paternityLeaveSchema");
const { AdoptionLeave } = require("../models/adoptionLeaveModel");

const initChangeStreams = () => {
  EmpModel.watch().on("change", async (change) => {
    console.log("Change detected in User collection:", change);

    if (change.operationType === "insert") {
      try {
        const newUser = change.fullDocument;
        console.log(newUser.isPaternity);
        if (newUser.isPaternity) {
          const paternity = new PaternityLeave({
            empId: newUser.empId,
            opBalance: 0,
            credit: 5,
            totalEligibility: 5,
            closingBalance: 5,
          });
          await paternity.save();
        }

        if (newUser.isAdpt) {
          const Adpt = new AdoptionLeave({
            empId: newUser.empId,
            opBalance: 0,
            credit: 42,
            totalEligibility: 42,
            closingBalance: 42,
          });
          await Adpt.save();
        }

        if (newUser.role === "3P") {
          const cl = new CasualLeave({
            empId: newUser.empId,
            opBalance: 0,
            credit: 12,
            totalEligibility: 12,
            closingBalance: 12,
          });
          await cl.save();
        } else if (newUser.role === "GVR") {
          const cl = new CasualLeave({
            empId: newUser.empId,
            opBalance: 0,
            credit: 10,
            totalEligibility: 10,
            closingBalance: 10,
          });

          const pl = new PrivelageLeave({
            empId: newUser.empId,
            opBalance: 0,
            credit: 16,
            totalEligibility: 16,
            closingBalance: 16,
            carryForward: 16,
          });

          await cl.save();
          await pl.save();
        }
        console.log("Document saved");
      } catch (error) {
        console.error("Error adding data");
      }
    }
  });
};

module.exports = initChangeStreams;
