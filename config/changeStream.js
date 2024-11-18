const { EmpModel } = require("../models/employeeSchema");
const { CasualLeave } = require("../models/casualLeaveSchema");
const { PrivelageLeave } = require("../models/privelageLeaveSchema");
const { PaternityLeave } = require("../models/paternityLeaveSchema");
const { AdoptionLeave } = require("../models/adoptionLeaveModel");

const initChangeStreams = () => {
  const changeStream = EmpModel.watch([{ $match: { operationType: "insert" } }]);

  changeStream.on("change", async (change) => {
    try {
      const newUser = change.fullDocument;

      console.log(`Processing new user: ${newUser.empId}`);

      // Check and create Paternity Leave if applicable
      if (newUser.isPaternity) {
        await PaternityLeave.findOneAndUpdate(
          { empId: newUser.empId },
          {
            empId: newUser.empId,
            opBalance: 0,
            credit: 5,
            totalEligibility: 5,
            closingBalance: 5,
          },
          { upsert: true, new: true }
        );
      }

      // Check and create Adoption Leave if applicable
      if (newUser.isAdpt) {
        await AdoptionLeave.findOneAndUpdate(
          { empId: newUser.empId },
          {
            empId: newUser.empId,
            opBalance: 0,
            credit: 42,
            totalEligibility: 42,
            closingBalance: 42,
          },
          { upsert: true, new: true }
        );
      }

      // Check and create Casual Leave and Privilege Leave based on role
      if (newUser.role === "3P") {
        await CasualLeave.findOneAndUpdate(
          { empId: newUser.empId },
          {
            empId: newUser.empId,
            opBalance: 0,
            credit: 12,
            totalEligibility: 12,
            closingBalance: 12,
          },
          { upsert: true, new: true }
        );
      } else if (newUser.role === "GVR") {
        await CasualLeave.findOneAndUpdate(
          { empId: newUser.empId },
          {
            empId: newUser.empId,
            opBalance: 0,
            credit: 10,
            totalEligibility: 10,
            closingBalance: 10,
            carryForward: 10,
          },
          { upsert: true, new: true }
        );

        await PrivelageLeave.findOneAndUpdate(
          { empId: newUser.empId },
          {
            empId: newUser.empId,
            opBalance: 0,
            credit: 16,
            totalEligibility: 16,
            closingBalance: 16,
            carryForward: 16,
          },
          { upsert: true, new: true }
        );
      }

      console.log(`Leave records created/updated for user: ${newUser.empId}`);
    } catch (error) {
      console.error(`Error processing user ${change.fullDocument?.empId}: ${error.message}`);
    }
  });

  changeStream.on("error", (error) => {
    console.error(`Change stream error: ${error.message}`);
  });

  changeStream.on("close", () => {
    console.log("Change stream closed.");
  });
};

module.exports = initChangeStreams;
