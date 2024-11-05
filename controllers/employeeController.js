const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config("./env");
const { EmpModel } = require("../models/employeeSchema");
const { CasualLeave } = require("../models/casualLeaveSchema");
const { PrivelageLeave } = require("../models/privelageLeaveSchema");
const { PaternityLeave } = require("../models/paternityLeaveSchema");
const { AdoptionLeave } = require("../models/adoptionLeaveModel");

const today = new Date();
const year = today.getFullYear();

const addAdmin = async (req, res) => {
  try {
    const {
      empId,
      empName,
      empMail,
      empPhone,
      role,
      vendor,
      gender,
      managerId,
      dateOfJoining,
      function: empFunction,
      department,
      level,
      location,
      unit,
      isAdpt,
      isPaternity,
      permissionEligible,
      permissionAvailed,
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await EmpModel.findOne({ empId });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    console.log("check");

    count++;
    const userName =
      year.toString().substring(2, 4) +
      "GVRADMIN" +
      count.toString().padStart(3, "0");
    const password = "admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(userName);

    const newEmployee = new EmpModel({
      empId,
      userName,
      password: hashedPassword,
      empName,
      empMail,
      empPhone,
      role,
      vendor,
      gender,
      managerId: "000123654",
      manager: "HR",
      reportingManager: "hr@gmail.com",
      dateOfJoining,
      function: empFunction,
      department,
      level,
      location,
      unit,
      isPaternity,
      isAdpt,
      permissionEligible,
      permissionAvailed,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

// Signup
const Register = async (req, res) => {
  try {
    const {
      id,
      empId,
      empName,
      empMail,
      empPhone,
      role,
      vendor,
      gender,
      managerId,
      dateOfJoining,
      function: empFunction,
      department,
      level,
      location,
      unit,
      isAdpt,
      isPaternity,
      permissionEligible,
      permissionAvailed,
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await EmpModel.findOne({ empId });
    const existingPhone = await EmpModel.findOne({ empPhone });
    const existingMail = await EmpModel.findOne({ empMail });
    const emp = await EmpModel.findOne({ empId: id });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (emp.role != "Admin") {
      return res
        .status(403)
        .json({ message: "Only Admin can create new employee" });
    }
    if (existingEmployee || existingPhone || existingMail) {
      return res
        .status(400)
        .json({ message: "Employee with this ID already exists" });
    }

    const empCount = await EmpModel.findOne().sort({ $natural: -1 }).limit(1);
    console.log(empCount);
    let count = parseInt(empCount.userName.slice(-3));
    console.log(count);
    count++;
    const userName =
      year.toString().substring(2, 4) +
      vendor +
      count.toString().padStart(3, "0");
    console.log(userName);
    const password = "user@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const empManager = await EmpModel.findOne({ userName: managerId });

    // Create new employee
    const newEmployee = new EmpModel({
      empId,
      userName,
      password: hashedPassword,
      empName,
      empMail,
      empPhone: "+91" + empPhone,
      role,
      vendor,
      gender,
      managerId,
      manager: empManager.empName,
      reportingManager: empManager.empMail,
      dateOfJoining,
      function: empFunction,
      department,
      level,
      location,
      unit,
      isPaternity,
      isAdpt,
      permissionEligible,
      permissionAvailed,
    });

    if (role === "GVR" || role === "3P") {
      const data = await EmpModel.findOne({ userName: managerId });
      if (!data) {
        return res.status(402).json({ message: "Manager not found" });
      } else {
        console.log("Adding employee...");
        await EmpModel.findByIdAndUpdate(data._id, {
          $push: { employees: empPhone },
        });
        console.log("employee added to the manager");
      }
    }

    if (isPaternity) {
      const paternity = new PaternityLeave({
        empId,
        opBalance: 0,
        credit: 5,
        totalEligibility: 5,
        closingBalance: 5,
      });
      await paternity.save();
    }

    if (isAdpt) {
      const Adpt = new AdoptionLeave({
        empId,
        opBalance: 0,
        credit: 42,
        totalEligibility: 42,
        closingBalance: 42,
      });
      await Adpt.save();
    }

    if (role === "3P") {
      const cl = new CasualLeave({
        empId,
        opBalance: 0,
        credit: 12,
        totalEligibility: 12,
        closingBalance: 12,
      });
      await cl.save();
    } else if (role === "GVR") {
      const cl = new CasualLeave({
        empId,
        opBalance: 0,
        credit: 10,
        totalEligibility: 10,
        closingBalance: 10,
      });

      const pl = new PrivelageLeave({
        empId,
        opBalance: 0,
        credit: 16,
        totalEligibility: 16,
        closingBalance: 16,
        carryForward: 16,
      });

      await cl.save();
      await pl.save();
    }

    await newEmployee.save();

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login
const Login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Find employee by ID
    const employee = await EmpModel.findOne({ userName });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        empId: employee.empId,
        role: employee.role,
        empName: employee.empName,
        empMail: employee.empMail,
        managerMail: employee.reportingManager,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const RFIDLogin = async (req, res) => {
  try {
    const { empId } = req.body;

    const employee = await EmpModel.findOne({ empId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        empId: employee.empId,
        role: employee.role,
        empName: employee.empName,
        empMail: employee.empMail,
        managerMail: employee.reportingManager,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all employees
const GetEmp = async (req, res) => {
  try {
    console.log(req.body.empId);
    const employees = await EmpModel.find({ empId: req.body.empId });
    if (!employees) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllEmp = async (req, res) => {
  try {
    const employee = await EmpModel.findOne({ empId: req.body.empId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.role === "Manager") {
      const emp = await EmpModel.find({ managerId: employee.userName });
      res.status(200).json(emp);
    } else if (employee.role === "Admin") {
      const emp = await EmpModel.find({});
      res.status(200).json(emp);
    } else {
      res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

const updateEmpDetails = async (req, res) => {
  try {
    console.log(req.body);
    const {
      id,
      empId,
      empName,
      empMail,
      empPhone,
      role,
      vendor,
      gender,
      managerId,
      function: empFunction,
      department,
      level,
      location,
      unit,
      isAdpt,
      isPaternity,
    } = req.body;
    const admin = await EmpModel.findOne({ empId: id });
    if (!admin) {
      res.status(404).json({ message: "Employee not found" });
    } else if (admin.role === "Admin") {
      const emp = await EmpModel.findOne({ empId });
      const man = await EmpModel.findOne({ userName: managerId });
      const updateEmpDetails = await EmpModel.updateOne(
        { empId: empId },
        {
          empName: empName,
          empMail: empMail,
          empPhone: empPhone,
          role: role,
          vendor: vendor,
          gender: gender,
          managerId: managerId,
          manager: man.empName,
          reportingManager: man.empMail,
          function: empFunction,
          department: department,
          level: level,
          location: location,
          unit: unit,
          isAdpt: isAdpt,
          isPaternity: isPaternity,
        }
      );
      res
        .status(200)
        .json({ message: "Employee details updated successfully" });
    } else {
      res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

const deleteEmp = async (req, res) => {
  try {
    const { id, empId } = req.body;
    const admin = await EmpModel.findOne({ empId: id });
    if (!admin) {
      return res.status(404).json({ message: "Employee not found" });
    } else if (admin.role === "Admin") {
      const emp = await EmpModel.findOneAndDelete({ empId });
      res.status(200).json({ message: "Employee deleted successfully" });
    } else {
      return res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

const importEmp = async (req, res) => {
  try {
    const { id, emp } = req.body;
    const admin = await EmpModel.findOne({ empId: id });
    if (!admin) {
      return res.status(404).json({ message: "Employee not found" });
    } else if (admin.role === "Admin") {
      for (const obj of emp) {
        const existingEmployee = await EmpModel.findOne({ empId: obj.empId });
        const existingPhone = await EmpModel.findOne({ empPhone: obj.empPhone });
        const existingMail = await EmpModel.findOne({ empMail: obj.empMail });

        if (existingEmployee || existingPhone || existingMail) {
          return res
            .status(400)
            .json({ message: "Employee with this ID, phone, or email already exists" });
        }

        const empCount = await EmpModel.findOne().sort({ $natural: -1 }).limit(1);
        let count = empCount ? parseInt(empCount.userName.slice(-3)) : 0;
        count++;
        const userName =
          new Date().getFullYear().toString().substring(2, 4) +
          obj.vendor +
          count.toString().padStart(3, "0");
        const password = "user@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const empManager = await EmpModel.findOne({ userName: obj.managerId });
        if (!empManager) {
          return res.status(402).json({ message: "Manager not found" });
        }

        const newEmployee = new EmpModel({
          empId: obj.empId,
          userName,
          password: hashedPassword,
          empName: obj.empName,
          empMail: obj.empMail,
          empPhone: "+91" + obj.empPhone,
          role: obj.role,
          vendor: obj.vendor,
          gender: obj.gender,
          managerId: obj.managerId,
          manager: empManager.empName,
          reportingManager: empManager.empMail,
          dateOfJoining: obj.dateOfJoining,
          function: obj.function,
          department: obj.department,
          level: obj.level,
          location: obj.location,
          unit: obj.unit,
          isPaternity: obj.isPaternity,
          isAdpt: obj.isAdpt,
        });

        if (obj.role === "GVR" || obj.role === "3P") {
          await EmpModel.findByIdAndUpdate(empManager._id, {
            $push: { employees: obj.empPhone },
          });
        }

        if (obj.isPaternity) {
          const paternity = new PaternityLeave({
            empId: obj.empId,
            opBalance: 0,
            credit: 5,
            totalEligibility: 5,
            closingBalance: 5,
          });
          await paternity.save();
        }

        if (obj.isAdpt) {
          const Adpt = new AdoptionLeave({
            empId: obj.empId,
            opBalance: 0,
            credit: 42,
            totalEligibility: 42,
            closingBalance: 42,
          });
          await Adpt.save();
        }

        if (obj.role === "3P") {
          const cl = new CasualLeave({
            empId: obj.empId,
            opBalance: 0,
            credit: 12,
            totalEligibility: 12,
            closingBalance: 12,
          });
          await cl.save();
        } else if (obj.role === "GVR") {
          const cl = new CasualLeave({
            empId: obj.empId,
            opBalance: 0,
            credit: 10,
            totalEligibility: 10,
            closingBalance: 10,
          });
          const pl = new PrivelageLeave({
            empId: obj.empId,
            opBalance: 0,
            credit: 16,
            totalEligibility: 16,
            closingBalance: 16,
            carryForward: 16,
          });
          await cl.save();
          await pl.save();
        }

        await newEmployee.save();
      }
      res.status(201).json({ message: "Employee(s) registered successfully" });
    } else {
      return res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};


const forgetPassword = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const employee = await EmpModel.findOne({ userName });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatePassword = await EmpModel.findOneAndUpdate(
      { userName },
      { password: hashedPassword }
    );
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

module.exports = {
  addAdmin,
  Register,
  Login,
  RFIDLogin,
  GetEmp,
  getAllEmp,
  updateEmpDetails,
  deleteEmp,
  importEmp,
  forgetPassword,
};
