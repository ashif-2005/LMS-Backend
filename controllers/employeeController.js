const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config('./env')
const { EmpModel } = require('../models/employeeSchema');
const { CasualLeave } = require('../models/casualLeaveSchema');
const { PrivelageLeave } = require('../models/privelageLeaveSchema');
const { PaternityLeave } = require('../models/paternityLeaveSchema');
const { AdoptionLeave } = require('../models/adoptionLeaveModel');

// Signup
const Register = async (req, res) => {
    try {
        const { empId, empName, empMail, empPhone, role, manager, designation, reportionManager, dateOfJoining, function: empFunction, department, level, location, isAdpt, isPaternity, permissionEligible, permissionAvailed } = req.body;

        // Check if employee already exists
        const existingEmployee = await EmpModel.findOne({ empId });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employee with this ID already exists' });
        }

        // Create new employee
        const newEmployee = new EmpModel({
            empId,
            empName,
            empMail,
            empPhone,
            role,
            manager,
            designation,
            reportionManager,
            dateOfJoining,
            function: empFunction,
            department,
            level,
            location,
            isPaternity,
            isAdpt,
            permissionEligible,
            permissionAvailed
        });

        if(role === "GVR" || role === "3P"){
            const data = await EmpModel.findOne({empName: manager})
            if(!data){
                return res.status(400).json({message: "Manager not found"})
            }
            else{
                console.log("Adding employee...")
                await EmpModel.findByIdAndUpdate(data._id, {$push: {employees: empPhone}})
                console.log("employee added to the manager")
            }
        }

        if(isPaternity){
            const paternity = new PaternityLeave({
                empId,
                opBalance: 0,
                credit: 5,
                totalEligibility: 5,
                closingBalance: 5
            })
            await paternity.save()
        }

        if(isAdpt){
            const Adpt = new AdoptionLeave({
                empId,
                opBalance: 0,
                credit: 42,
                totalEligibility: 42,
                closingBalance: 42
            })
            await Adpt.save()
        }

        if(role === "3P"){
            const cl = new CasualLeave({
                empId,
                opBalance: 0,
                credit: 12,
                totalEligibility: 12,
                closingBalance: 12
            })

            await cl.save()
        }
        else if(role === "GVR"){
            const cl = new CasualLeave({
                empId,
                opBalance: 0,
                credit: 10,
                totalEligibility: 10,
                closingBalance: 10
            })

            const pl = new PrivelageLeave({
                empId,
                opBalance: 0,
                credit: 16,
                totalEligibility: 16,
                closingBalance: 16,
                carryForward: 16
            })

            await cl.save()
            await pl.save()
        }

        await newEmployee.save();

        res.status(201).json({ message: 'Employee registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// // Login
// const Login = async (req, res) => {
//     try {
//         const { empId, password } = req.body;

//         // Find employee by ID
//         const employee = await EmpModel.findOne({ empId });
//         if (!employee) {
//             return res.status(400).json({ message: 'Employee not found' });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, employee.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ empId: employee.empId, role: employee.role }, process.env.SECRET, { expiresIn: '1h' });

//         res.status(200).json({ message: 'Login successful', token });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// }

const RFIDLogin = async(req,res) =>{
    try {
        const { empId } = req.body;

        const employee = await EmpModel.findOne({ empId });
        if (!employee) {
            return res.status(400).json({ message: 'Employee not found'});
        }

        // Generate JWT token
        const token = jwt.sign({ empId: employee.empId, role: employee.role, empName: employee.empName, empMail: employee.empMail, managerMail: employee.reportionManager}, process.env.SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// Get all employees
const GetEmp = async (req, res) => {
    try {
        console.log(req.body.empId);
        const employees = await EmpModel.find({"empId": req.body.empId});
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error});
    }
}

const getAllEmp = async(req, res) => {
    try{
        const employee = await EmpModel.findOne({"empId": req.body.empId})
        if(employee.role === "Manager"){
            const emp = await EmpModel.find({manager: employee.empName});
            res.status(200).json(emp);
        }
        else{
            res.status(400).json({message: "Permission Denied"})
        }
    }
    catch(err){
        res.status(500).json({message: "Server Error", error: err})
    }
}

module.exports = {Register,RFIDLogin,GetEmp, getAllEmp}