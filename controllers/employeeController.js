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
      subDepartment,
      level,
      location,
      unit,
      isAdpt,
      isPaternity,
      permissionEligible,
      permissionAvailed,
    } = req.body;

    const userName =
      year.toString().substring(2, 4) +
      "GVRADMIN" +
      count.toString().padStart(3, "0");
    const password = "admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

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
      subDepartment,
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
      subDepartment,
      level,
      location,
      unit,
      isAdpt,
      isPaternity,
      permissionEligible,
      permissionAvailed,
    } = req.body;

    const emp = await EmpModel.findOne({ empId: id });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (emp.role != "Admin") {
      return res
        .status(403)
        .json({ message: "Only Admin can create new employee" });
    }
    const employee = await EmpModel.find({
      $or: [
        { empId: empId },
        { empPhone: empPhone },
        { empMail: empMail }
      ]
    });
    if (employee.length) {
      return res
        .status(400)
        .json({ message: "Employee with this ID already exists" });
    }

    const empCount = await EmpModel.findOne().sort({ $natural: -1 }).limit(1);
    let count = parseInt(empCount.userName.slice(-3));
    const userName =
      year.toString().substring(2, 4) +
      vendor +
      (++count).toString().padStart(3, "0");

    const password = "user@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const empManager = await EmpModel.findOne({ userName: managerId });
    if (!empManager) {
      return res.status(402).json({ message: "Manager not found" });
    }
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
      subDepartment,
      level,
      location,
      unit,
      isPaternity,
      isAdpt,
      permissionEligible,
      permissionAvailed,
    });

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
        userName: employee.userName
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
        userName: employee.userName
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
      subDepartment,
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
          subDepartment: subDepartment,
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
      const emp = await EmpModel.findOne({ empId });
      if (!emp) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (emp.role === "3P") {
        await CasualLeave.findOneAndDelete({ empId });
      } else if (emp.role === "GVR") {
        await CasualLeave.findOneAndDelete({ empId });
        await PrivelageLeave.findOneAndDelete({ empId });
        if (emp.isAdpt) {
          await AdoptionLeave.findOneAndDelete({ empId });
        }
        if (emp.isPaternity) {
          await PaternityLeave.findOneAndDelete({ empId });
        }
      }
      await EmpModel.findOneAndDelete({ empId });
      res.status(200).json({ message: "Employee deleted successfully" });
    } else {
      return res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

const getManager = async (user) => {
  try {
    const empManager = await EmpModel.findOne({ userName: user.managerId });
    if (!empManager) {
      return res.status(402).json({ message: "Manager not found" });
    }
    return empManager;
  } catch (error) {
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
      const empCount = await EmpModel.findOne().sort({ $natural: -1 }).limit(1);
      let count = empCount ? parseInt(empCount.userName.slice(-3)) : 0;

      const password = "user@123";
      const hashedPassword = await bcrypt.hash(password, 10);

      const usersWithIds = await Promise.all(
        emp.map(async (user, index) => {
          const existingEmployee = await EmpModel.findOne({
            $or: [
              { empId: user.empId },
              { empPhone: user.empPhone },
              { empMail: user.empMail },
            ],
          });

          if (existingEmployee) return null;

          return {
            ...user,
            userName:
              today.getFullYear().toString().substring(2, 4) +
              user.vendor +
              (++count).toString().padStart(3, "0"),
            password: hashedPassword,
            empPhone: "+91" + user.empPhone,
            manager: await getManager(user).then(
              (employee) => employee.empName
            ),
            reportingManager: await getManager(user).then(
              (employee) => employee.empMail
            ),
          };
        })
      );

      const filteredUsers = usersWithIds.filter((user) => user !== null);

      await EmpModel.insertMany(filteredUsers);
      res.status(201).json({ message: "Employees registered successfully" });
    } else {
      return res.status(400).json({ message: "Permission Denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};

const checkExistingPassword = async(req, res) => {
  try {
    const { empId, password } = req.body;

    const employee = await EmpModel.findOne({ empId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Old password verified"});
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

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
  checkExistingPassword,
  forgetPassword,
};
