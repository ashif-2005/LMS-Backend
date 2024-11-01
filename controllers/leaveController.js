const path = require("path");
const { LeaveModel } = require("../models/leaveSchema");
const { EmpModel } = require("../models/employeeSchema");
const { CasualLeave } = require("../models/casualLeaveSchema");
const { PrivelageLeave } = require("../models/privelageLeaveSchema");
const { PaternityLeave } = require("../models/paternityLeaveSchema");
const { Accepted, Rejected } = require("../utils/AdminResponseLeave");
const { AdoptionLeave } = require("../models/adoptionLeaveModel");
const { Message } = require("../utils/message");

const today = new Date();

const date = today.getDate();

const month = today.getMonth() + 1;

const year = today.getFullYear();

// Apply for leave
const ApplyLeave = async (req, res) => {
  try {
    // console.log(req.body)
    const {
      empId,
      leaveType,
      from,
      to,
      numberOfDays,
      leaveDays,
      reasonType,
      reason,
      LOP,
    } = req.body;
    var list = [];

    for (
      let i = parseInt(from.date.slice(0, 2)) + 1;
      i < parseInt(to.date.slice(0, 2));
      i++
    ) {
      if (i < 10) {
        list.push(0 + i.toString());
      } else {
        list.push(i.toString());
      }
    }

    console.log(list);

    const emp = await EmpModel.findOne({ empId });

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (emp.role === "3P") {
      if (leaveType === "Casual Leave") {
        const cl = await CasualLeave.findOne({ empId });
        const leave = new LeaveModel({
          empId,
          empName: emp.empName,
          role: emp.role,
          manager: emp.manager,
          leaveType,
          from,
          to,
          numberOfDays,
          leaveDays,
          days: list,
          reasonType,
          reason,
          today: `${year}/${month}/${date}`,
          LOP,
        });
        await leave.save();
        res.status(201).json({ message: "Leave applied successfully", leave });
      } else if (leaveType === "Paternity Leave" && emp.isPaternity) {
        const pl = await PaternityLeave.findOne({ empId });
        const leave = new LeaveModel({
          empId,
          empName: emp.empName,
          role: emp.role,
          manager: emp.manager,
          leaveType,
          from,
          to,
          numberOfDays,
          leaveDays,
          days: list,
          reasonType,
          reason,
          today: `${year}/${month}/${date}`,
          LOP,
        });
        await leave.save();
        res.status(201).json({ message: "Leave applied successfully", leave });
      } else {
        return res
          .status(400)
          .json({ message: "Permission Denied to Apply Leave" });
      }
    } else {
      if (leaveType === "Casual Leave") {
        const cl = await CasualLeave.findOne({ empId });
        const leave = new LeaveModel({
          empId,
          empName: emp.empName,
          role: emp.role,
          manager: emp.manager,
          leaveType,
          from,
          to,
          numberOfDays,
          leaveDays,
          days: list,
          reasonType,
          reason,
          today: `${year}/${month}/${date}`,
          LOP,
        });
        await leave.save();
        res.status(201).json({ message: "Leave applied successfully", leave });
      } else if (leaveType === "Privilege Leave") {
        const pl = await PrivelageLeave.findOne({ empId });
        if (pl.availed < 16) {
          const leave = new LeaveModel({
            empId,
            empName: emp.empName,
            role: emp.role,
            manager: emp.manager,
            leaveType,
            from,
            to,
            numberOfDays,
            leaveDays,
            days: list,
            reasonType,
            reason,
            today: `${year}/${month}/${date}`,
            LOP,
          });
          await leave.save();
          res
            .status(201)
            .json({ message: "Leave applied successfully", leave });
        }
      } else if (leaveType === "Paternity Leave" && emp.isPaternity) {
        const pl = await PaternityLeave.findOne({ empId });
        const leave = new LeaveModel({
          empId,
          empName: emp.empName,
          role: emp.role,
          manager: emp.manager,
          leaveType,
          from,
          to,
          numberOfDays,
          leaveDays,
          days: list,
          reasonType,
          reason,
          today: `${year}/${month}/${date}`,
          LOP,
        });
        await leave.save();
        const manager = await EmpModel.findOne({ manager: emp.manager });
        Message(
          manager.empPhone,
          `Dear ${manager.empName},\n\nYou have received a new leave request from *${emp.empName}*.\n\n*Leave Details:*\n- *Leave Type:* ${leave.leaveType}\n- *Start Date:* ${leave.from.date}\n- *End Date:* ${leave.to.date}\n- *Number of Days:* ${leave.leaveDays}\n- *Leave With Pay:* ${leave.numberOfDays}\n- *Loss of Pay:* ${leave.LOP}\n\nPlease take the necessary action either through your email or by logging into the LMS.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
        );
        res.status(201).json({ message: "Leave applied successfully", leave });
      } else {
        return res
          .status(400)
          .json({ message: "Permission Denied to Apply Leave" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const withDrawLeave = async (req, res) => {
  try {
    const { leaveId } = req.body;
    const leave = await LeaveModel.findById(leaveId);
    if (leave.status === "Pending") {
      leave.status = "Withdrawn";
      await leave.save();
      res.status(200).json({ message: "Leave withdrawn successfully" });
    } else {
      res.status(400).json({
        message: "Leave request has already been responded as " + leave.status,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const RejectAccepted = async (req, res) => {
  try {
    const { empId, leaveId } = req.body;
    console.log(leaveId);
    const leave = await LeaveModel.findById(leaveId);
    const emp = await EmpModel.findOne({ empId });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (emp.role === "Manager") {
      if (leave.leaveType === "Casual Leave" && leave.role === "3P") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed -= leave.numberOfDays;
        cl.LOP -= leave.LOP;
        cl.closingBalance += leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Casual Leave" && leave.role === "GVR") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed -= leave.numberOfDays;
        cl.LOP -= leave.LOP;
        cl.closingBalance += leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Privelage Leave") {
        const pl = await PrivelageLeave.findOne({ empId: leave.empId });
        pl.availed -= leave.numberOfDays;
        pl.LOP -= leave.LOP;
        pl.closingBalance += leave.numberOfDays;
        pl.carryForward += leave.numberOfDays;
        await pl.save();
      } else if (leave.leaveType === "Paternity Leave") {
        const pl = await PaternityLeave.findOne({ empId: leave.empId });
        pl.availed -= leave.numberOfDays;
        pl.LOP -= leave.LOP;
        pl.closingBalance += leave.numberOfDays;
        await pl.save();
      } else {
        const adpt = await AdoptionLeave.findById({ empId: leave.empId });
        adpt.availed -= leave.numberOfDays;
        adpt.LOP -= leave.LOP;
        adpt.closingBalance += leave.numberOfDays;
        adpt.save();
      }
      leave.status = "Denied";
      await leave.save();
      Message(
        emp.empPhone,
        `Dear ${emp.empName},\n\nYour leave has been *REJECTED* ❌.\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
      );
      res.status(200).json({ message: "Leave status updated successfully" });
    } else {
      res
        .status(404)
        .json({ message: "You are not allowed perform this operation" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const AcceptRejected = async (req, res) => {
  try {
    const { leaveId } = req.body;
    console.log(leaveId);
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status === "Withdrawn") {
      res.status(202).json({ message: "Already Withdrawn" });
    } else {
      if (leave.leaveType === "Casual Leave" && leave.role === "3P") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Casual Leave" && leave.role === "GVR") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Privelage Leave") {
        const pl = await PrivelageLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        pl.carryForward -= leave.numberOfDays;
        await pl.save();
      } else if (leave.leaveType === "Paternity Leave") {
        const pl = await PaternityLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        await pl.save();
      } else {
        const atpt = await AdoptionLeave.findById({ empId: leave.empId });
        adpt.availed += leave.numberOfDays;
        adpt.LOP += leave.LOP;
        adpt.closingBalance -= leave.numberOfDays;
        adpt.save();
      }
      leave.status = "Approved";
      await leave.save();
      const emp = await EmpModel.findOne({ empId: leave.empId });
      Accepted("mohammedashif.a2022cse@sece.ac.in");
      Message(
        emp.empPhone,
        `Dear ${emp.empName},\n\nYour leave has been *ACCEPTED* ✅.\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
      );
      res.status(200).json({ message: "Leave approved successfully", leave });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Accept leave
const AcceptLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    console.log("leave in backend", leaveId);

    const leave = await LeaveModel.findById(leaveId);
    console.log("leave is ", leave);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status === "Approved") {
      const filePath = path.join(__dirname, "../view/alreadyAccepted.html");
      res.sendFile(filePath);
    } else if (leave.status === "Denied") {
      const filePath = path.join(__dirname, "../view/alreadyRejected.html");
      res.sendFile(filePath);
    } else if (leave.status === "Withdrawn") {
      const filePath = path.join(__dirname, "../view/withdraw.html"); //backend\view\withdraw.html
      res.sendFile(filePath);
    } else {
      if (leave.leaveType === "Casual Leave" && leave.role === "3P") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Casual Leave" && leave.role === "GVR") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Privelage Leave") {
        const pl = await PrivelageLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        pl.carryForward -= leave.numberOfDays;
        await pl.save();
      } else if (leave.leaveType === "Paternity Leave") {
        const pl = await PaternityLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        await pl.save();
      } else {
        const atpt = await AdoptionLeave.findById({ empId: leave.empId });
        adpt.availed += leave.numberOfDays;
        adpt.LOP += leave.LOP;
        adpt.closingBalance -= leave.numberOfDays;
        adpt.save();
      }
      if (leave.status === "Pending") {
        leave.status = "Approved";
        await leave.save();
        const filePath = path.join(__dirname, "../view/accept.html");
        const emp = await EmpModel.findOne({ empId: leave.empId });
        Accepted("mohammedashif.a2022cse@sece.ac.in");
        Message(
          emp.empPhone,
          `Dear ${emp.empName},\n\nYour leave has been *ACCEPTED* ✅\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
        );
        res.sendFile(filePath);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const Accept = async (req, res) => {
  try {
    const { leaveId } = req.body;
    console.log(leaveId);
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status === "Approved") {
      res.status(202).json({ message: "Already Accepted" });
    } else if (leave.status === "Rejected") {
      res.status(202).json({ message: "Already Rejected" });
    } else if (leave.status === "Withdrawn") {
      res.status(202).json({ message: "Already Withdrawn" });
    } else {
      if (leave.leaveType === "Casual Leave" && leave.role === "3P") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Casual Leave" && leave.role === "GVR") {
        console.log("CL");
        const cl = await CasualLeave.findOne({ empId: leave.empId });
        cl.availed += leave.numberOfDays;
        cl.LOP += leave.LOP;
        cl.closingBalance -= leave.numberOfDays;
        await cl.save();
      } else if (leave.leaveType === "Privelage Leave") {
        const pl = await PrivelageLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        pl.carryForward -= leave.numberOfDays;
        await pl.save();
      } else if (leave.leaveType === "Paternity Leave") {
        const pl = await PaternityLeave.findOne({ empId: leave.empId });
        pl.availed += leave.numberOfDays;
        pl.LOP += leave.LOP;
        pl.closingBalance -= leave.numberOfDays;
        await pl.save();
      } else {
        const atpt = await AdoptionLeave.findById({ empId: leave.empId });
        adpt.availed += leave.numberOfDays;
        adpt.LOP += leave.LOP;
        adpt.closingBalance -= leave.numberOfDays;
        adpt.save();
      }
      if (leave.status === "Pending") {
        leave.status = "Approved";
        await leave.save();
        const emp = await EmpModel.findOne({ empId: leave.empId });
        Accepted("mohammedashif.a2022cse@sece.ac.in");
        Message(
          emp.empPhone,
          `Dear ${emp.empName},\n\nYour leave has been *ACCEPTED* ✅.\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
        );
        res.status(200).json({ message: "Leave approved successfully", leave });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Deny leave
const DenyLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status === "Approved") {
      const filePath = path.join(__dirname, "../view/alreadyAccepted.html");
      res.sendFile(filePath);
    } else if (leave.status === "Denied") {
      const filePath = path.join(__dirname, "../view/alreadyRejected.html");
      res.sendFile(filePath);
    } else if (leave.status === "Withdrawn") {
      const filePath = path.join(__dirname, "../view/withdraw.html"); //backend\view\withdraw.html
      res.sendFile(filePath);
    } else {
      leave.status = "Denied";
      await leave.save();
      const filePath = path.join(__dirname, "../view/reject.html");
      const emp = await EmpModel.findOne({ empId: leave.empId });
      // Rejected(emp.empMail)
      Rejected("mohammedashif.a2022cse@sece.ac.in");
      Message(
        emp.empPhone,
        `Dear ${emp.empName},\n\nYour leave has been *REJECTED* ❌.\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
      );
      res.sendFile(filePath);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const Deny = async (req, res) => {
  try {
    const { leaveId } = req.body;

    const leave = await LeaveModel.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }
    if (leave.status === "Denied") {
      res.status(202).json({ message: "Already Denied" });
    } else if (leave.status === "Approved") {
      res.status(202).json({ message: "Already Accepted" });
    } else if (leave.status === "Withdrawn") {
      res.status(202).json({ message: "Already Withdrawn" });
    } else {
      leave.status = "Denied";
      await leave.save();
      const emp = await EmpModel.findOne({ empId: leave.empId });
      console.log(emp.empMail);
      Rejected("mohammedashif.a2022cse@sece.ac.in");
      Message(
        emp.empPhone,
        `Dear ${emp.empName},\n\nYour leave has been *REJECTED* ❌.\n*Leave Type:* ${leave.leaveType}\n*Start Date:* ${leave.from.date}\n*Number of Days:* ${leave.numberOfDays}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your leave.\n\nBest Regards,\n*Gilbarco Veeder-Root*`
      );
      res.status(200).json({ message: "Leave denied successfully", leave });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// const checkLeave = async (req, res) => {
//   try {
//     const { empId, role, leaveType, from, numberOfDays } = req.body;
//     console.log(from.date.slice(0, 2));
//     const fromData = await LeaveModel.find({
//       empId: empId,
//       "from.date": from.date,
//       "from.firstHalf": true,
//     });
//     const toData = await LeaveModel.find({
//       empId: empId,
//       "to.date": from.date,
//       "to.firstHalf": true,
//     });
//     const From = await LeaveModel.find({
//       empId: empId,
//       "from.date": from.date,
//       "from.secondHalf": true,
//     });
//     const To = await LeaveModel.find({
//       empId: empId,
//       "to.date": from.date,
//       "to.secondHalf": true,
//     });
//     if (from.firstHalf && (fromData.length || toData.length)) {
//       return res
//         .status(202)
//         .json({ mesasage: "Already leave had applied in the same day" });
//     } else if (from.secondHalf && (From.length || To.length)) {
//       console.log(from.firstHalf);
//       return res
//         .status(202)
//         .json({ mesasage: "Already leave had applied in the same day" });
//     }

//     const data = await LeaveModel.find({
//       empId: empId,
//       days: { $in: [from.date.slice(0, 2)] },
//     });
//     if (data.length) {
//       return res
//         .status(202)
//         .json({ mesasage: "Already leave had applied in the same day" });
//     }

//     console.log(numberOfDays >= 1);

//     if (role === "3P") {
//       console.log(role);
//       const cl = await CasualLeave.findOne({ empId: empId });
//       if (cl.availed >= 1) {
//         res.status(200).json({ CL: 0, LOP: numberOfDays });
//       } else if (numberOfDays > 1 && cl.availed === 0) {
//         console.log("****", numberOfDays);
//         res.status(200).json({ CL: 1, LOP: numberOfDays - 1 });
//       } else if (numberOfDays < 1) {
//         console.log("----", numberOfDays);
//         res.status(200).json({ CL: 0.5, LOP: 0 });
//       } else {
//         res.status(200).json({ CL: 1, LOP: 0 });
//       }
//     } else {
//       if (leaveType === "Casual Leave") {
//         const cl = await CasualLeave.findOne({ empId: empId });
//         console.log(cl);
//         if (numberOfDays >= cl.closingBalance) {
//           res.status(200).json({
//             CL: cl.closingBalance,
//             LOP: numberOfDays - cl.closingBalance,
//           });
//         } else {
//           res.status(200).json({ CL: numberOfDays, LOP: 0 });
//         }
//       } else if (leaveType === "privilage Leave") {
//         console.log("check");
//         const pl = await PrivelageLeave.findOne({ empId: empId });
//         console.log(pl);
//         if (numberOfDays >= pl.closingBalance) {
//           res.status(200).json({
//             PL: pl.closingBalance,
//             LOP: numberOfDays - pl.closingBalance,
//           });
//         } else {
//           res.status(200).json({ PL: numberOfDays, LOP: 0 });
//         }
//       } else if (leaveType === "Paternity Leave") {
//         const pl = await PaternityLeave.findOne({ empId: empId });
//         if (numberOfDays >= pl.x) {
//           res.status(200).json({
//             PAL: pl.closingBalance,
//             LOP: numberOfDays - pl.closingBalance,
//           });
//         } else {
//           res.status(200).json({ PAL: numberOfDays, LOP: 0 });
//         }
//       } else {
//         const adpt = await AdoptionLeave.findOne({ empId: empId });
//         if (numberOfDays > adpt.closingBalance) {
//           res.status(200).json({
//             ADPT: adpt.closingBalance,
//             LOP: numberOfDays - adpt.closingBalance,
//           });
//         } else {
//           res.status(200).json({ ADPT: numberOfDays, LOP: 0 });
//         }
//       }
//     }
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// };

const checkLeave = async (req, res) => {
  try {
    const { empId, role, LeaveType, from, numberOfDays } = req.body;
    console.log(from.date.slice(0, 2));
    const fromData = await LeaveModel.find({
      empId: empId,
      "from.date": from.date,
      "from.firstHalf": true,
    });
    const toData = await LeaveModel.find({
      empId: empId,
      "to.date": from.date,
      "to.firstHalf": true,
    });
    const From = await LeaveModel.find({
      empId: empId,
      "from.date": from.date,
      "from.secondHalf": true,
    });
    const To = await LeaveModel.find({
      empId: empId,
      "to.date": from.date,
      "to.secondHalf": true,
    });
    if (from.firstHalf && (fromData.length || toData.length)) {
      return res
        .status(202)
        .json({ mesasage: "Already leave had applied in the same day" });
    } else if (from.secondHalf && (From.length || To.length)) {
      return res
        .status(202)
        .json({ mesasage: "Already leave had applied in the same day" });
    }

    const data = await LeaveModel.find({
      empId: empId,
      days: { $in: [from.date.slice(0, 2)] },
    });
    console.log(data);
    if (data.length) {
      return res
        .status(202)
        .json({ mesasage: "Already leave had applied in the same day" });
    }
    if (role === "3P") {
      const cl = await CasualLeave.findOne({ empId: empId });
      if (1 - cl.availed >= numberOfDays) {
        res.status(200).json({
          message: "You can take leave",
        });
      } else {
        res.status(203).json({
          message: "Your leave limit exceeded please try applying leave in LOP",
        });
      }
    } else {
      console.log(LeaveType);
      if (LeaveType === "Casual Leave") {
        console.log("sample");
        const cl = await CasualLeave.findOne({ empId: empId });
        if (cl.closingBalance >= numberOfDays) {
          res.status(200).json({
            message: "You can take leave",
          });
        } else {
          res.status(203).json({
            message:
              "Your leave limit exceeded please try applying leave in LOP",
          });
        }
      } else if (LeaveType === "Privilege Leave") {
        pl = await PrivelageLeave.findOne({ empId });
        if (pl.closingBalance >= numberOfDays) {
          res.status(200).json({
            message: "You can take leave",
          });
        } else {
          res.status(203).json({
            message:
              "Your leave limit exceeded please try applying leave in LOP",
          });
        }
      } else if (LeaveType === "Paternity Leave") {
        p = await PaternityLeave.findOne({ empId });
        if (p.closingBalance >= numberOfDays) {
          res.status(200).json({
            message: "You can take leave",
          });
        } else {
          res.status(203).json({
            message:
              "Your leave limit exceeded please try applying leave in LOP",
          });
        }
      } else if (LeaveType === "Adoption Leave") {
        adpt = await AdoptionLeave.findOne({ empId });
        if (adpt.closingBalance >= numberOfDays) {
          res.status(200).json({
            message: "You can take leave",
          });
        } else {
          res.status(203).json({
            message:
              "Your leave limit exceeded please try applying leave in LOP",
          });
        }
      } else {
        res.status(400).json({ message: "Invalid Leave Type" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const GetLeave = async (req, res) => {
  try {
    const { empId } = req.body;
    const employee = await EmpModel.findOne({ empId });
    if (employee.role === "Manager") {
      const leaves = await LeaveModel.find({manager: employee.empName});

      res.status(200).json(leaves);
    } else {
      const leaves = await LeaveModel.find({ empId });
      res.status(200).json(leaves);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const cardData = async (req, res) => {
  try {
    const leaves = await LeaveModel.find({ today: `${year}/${month}/${date}` });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const weakData = async (req, res) => {
  try {
    const leaves = await LeaveModel.find({
      today: {
        $gte: `${year}/${month}/${date - 7}`,
        $lte: `${year}/${month}/${date}`,
      },
    });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const gauge = async(req, res) => {
  try{
    const { empId, employeeId } = req.body;
    const emp = await EmpModel.findOne({ empId });
    const leaves = await LeaveModel.find({manager: emp.empName});
    const leave = await LeaveModel.find({ empId: employeeId });
    res.status(200).json({all: leaves.length, emp: leave.length});
  }
  catch(err){
    res.status(500).json({ message: "Server error", err });
  }
}

module.exports = {
  checkLeave,
  ApplyLeave,
  withDrawLeave,
  AcceptRejected,
  RejectAccepted,
  AcceptLeave,
  Accept,
  DenyLeave,
  Deny,
  GetLeave,
  cardData,
  weakData,
  gauge
};
