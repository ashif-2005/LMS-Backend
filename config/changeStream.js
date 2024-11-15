const { EmpModel } = require("../models/employeeSchema");
const { CasualLeave } = require("../models/casualLeaveSchema");
const { PrivelageLeave } = require("../models/privelageLeaveSchema");
const { PaternityLeave } = require("../models/paternityLeaveSchema");
const { AdoptionLeave } = require("../models/adoptionLeaveModel");

const processedIds = new Set(); 

const initChangeStreams = () => {
  const changeStream = EmpModel.watch([{ $match: { "operationType": "insert" } }]);
  
  changeStream.on("change", async (change) => {
    try {
      const newUser = change.fullDocument;

      // Ensure the event is processed only once
      if (processedIds.has(newUser._id.toString())) {
        console.log(`Already processed user: ${newUser._id}`);
        return;
      }
      processedIds.add(newUser._id.toString());

      console.log(`Processing new user: ${newUser._id}`);

      // Handle leave allocation logic
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
        const adpt = new AdoptionLeave({
          empId: newUser.empId,
          opBalance: 0,
          credit: 42,
          totalEligibility: 42,
          closingBalance: 42,
        });
        await adpt.save();
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

      console.log(`Document processed and leave records created for user: ${newUser._id}`);
    } catch (error) {
      console.error(`Error processing user: ${error.message}`);
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
