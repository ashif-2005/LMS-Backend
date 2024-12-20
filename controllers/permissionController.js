const path = require('path');
const { EmpModel } = require('../models/employeeSchema');
const { LeaveModel } = require('../models/leaveSchema');
const { PermissionModel } = require('../models/permissionSchem'); // Replace with the correct path
const { Accepted, Rejected } = require('../utils/AdminResponseLeave')
const { Message } = require('../utils/message');

// Apply for permission
const ApplyPermission = async (req, res) => {
    try {
        const { empId, date, from, to, hrs, reason } = req.body;
        const emp = await EmpModel.findOne({empId});
        if (!empId) {
            return res.status(404).json({ message: 'Employee not found' });
        }
       
        if(emp.permissionAvailed < 4){
            const newPermission = new PermissionModel({
                empId,
                empName: emp.empName,
                role: emp.role,
                department: emp.department,
                subDepartment: emp.subDepartment,
                unit: emp.unit,
                gender: emp.gender,
                date,
                from,
                to,
                hrs,
                reason
            });
            await newPermission.save();
            res.status(201).json({ message: 'Permission applied successfully', permission: newPermission });
        }
        else{
            return res.status(203).json({ message: 'Insufficient permission level' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const withDrawPermission = async (req, res) => {
    try {
      const { permissionId } = req.body;
      const permission = await PermissionModel.findById(permissionId);
      if (permission.status === "Pending") {
        permission.status = "Withdrawn";
        await permission.save();
        res.status(200).json({ message: "Permission withdrawn successfully" });
      } else {
        res
          .status(400)
          .json({
            message:
              "Permission request has already been responded as " + leave.status,
          });
      }
    } catch (err) {
      res.status(500).json({ message: "Server error", err });
    }
}

const AcceptRejected = async(req, res) => {
    try {
        const { permissionId } = req.body;
        const permission = await PermissionModel.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        const emp = await EmpModel.findOne({empId: permission.empId});
        emp.permissionAvailed += permission.hrs;
        emp.permissionEligible -= permission.hrs;
        permission.status = 'Approved';
        await permission.save();
        await emp.save();
        Accepted('lingeshwaran.kv2022cse@sece.ac.in')
        Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *ACCEPTED* ✅\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:* ${permission.to}\n*Hours:* ${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
        res.status(200).json({message: "permission accepted successfully"})
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const rejectAccepted = async(req, res) => {
    try {
        const { permissionId } = req.body;
        const permission = await PermissionModel.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        const emp = await EmpModel.findOne({empId: permission.empId});
        emp.permissionAvailed -= permission.hrs;
        emp.permissionEligible += permission.hrs;
        permission.status = 'Denied';
        await permission.save();
        await emp.save();
        Accepted('lingeshwaran.kv2022cse@sece.ac.in')
        Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *REJECTED* ❌\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:*${permission.to}\n*Hours:*${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
        res.status(200).json({message: "permission accepted successfully"})
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// Accept permission
const AcceptPermission = async (req, res) => {
    try {
        const { permissionId } = req.params;
        console.log(permissionId);
        const permission = await PermissionModel.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        const emp = await EmpModel.findOne({empId: permission.empId});
        console.log(emp);

        if (permission.status === 'Approved'){
            const filePath = path.join(__dirname, "../view/alreadyAccepted.html");
            res.sendFile(filePath);
        }
        else if(permission.status === 'Denied'){
            const filePath = path.join(__dirname, "../view/alreadyRejected.html");
            res.sendFile(filePath);
        }
        else if(permission.status === 'Withdrawn'){
            const filePath = path.join(__dirname, "../view/withdraw.html"); //backend\view\withdraw.html
            res.sendFile(filePath);
        }
        else{
            emp.permissionAvailed += permission.hrs;
            emp.permissionEligible -= permission.hrs;
            permission.status = 'Approved';
            await permission.save();
            await emp.save();
            console.log(__dirname)
            const filePath = path.join(__dirname, "../view/accept.html");
            Accepted('lingeshwaran.kv2022cse@sece.ac.in')
            Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *ACCEPTED* ✅\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:* ${permission.to}\n*Hours:* ${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
            res.sendFile(filePath);
            // res.status(200).json({message: "Permission granted"})
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const Accept = async (req, res) => {
    try {
        const { permissionId } = req.body;
        console.log(permissionId);
        const permission = await PermissionModel.findById(permissionId);
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        const emp = await EmpModel.findOne({empId: permission.empId});
        console.log(emp);

        if (permission.status === 'Approved'){
            res.status(202).json({ message: 'Permission request has already been approved' });
        }
        else if(permission.status === 'Denied'){
            res.status(202).json({ message: 'Permission request has already been denied' });
        }
        else if(permission.status === 'Withdrawn'){
            res.status(202).json({ message: 'Permission request has already been withdrawn' });
        }
        else{
            emp.permissionAvailed += permission.hrs;
            emp.permissionEligible -= permission.hrs;
            permission.status = 'Approved';
            await permission.save();
            await emp.save();
            Accepted('lingeshwaran.kv2022cse@sece.ac.in')
            Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *ACCEPTED* ✅\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:*${permission.to}\n*Hours:*${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
            res.status(200).json({ message: 'Permission approved successfully', permission });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// Deny permission
const DenyPermission = async (req, res) => {
    try {
        const { permissionId } = req.params;

        const permission = await PermissionModel.findById(permissionId);
        const emp = await EmpModel.findOne({empId: permission.empId});
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        if (permission.status === 'Approved'){
            const filePath = path.join(__dirname, "../view/alreadyAccepted.html");
            res.sendFile(filePath);
        }
        else if(permission.status === 'Denied'){
            const filePath = path.join(__dirname, "../view/alreadyRejected.html");
            res.sendFile(filePath);
        }
        else if(permission.status === 'Withdrawn'){
            const filePath = path.join(__dirname, "../view/withdraw.html"); //backend\view\withdraw.html
            res.sendFile(filePath);
        }
        else{
            permission.status = 'Denied';
            await permission.save();
            const filePath = path.join(__dirname, "../view/reject.html");
            Rejected('lingeshwaran.kv2022cse@sece.ac.in')
            Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *REJECTED* ❌\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:*${permission.to}\n*Hours:*${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
            res.sendFile(filePath);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const Deny = async (req, res) => {
    try {
        const { permissionId } = req.body;

        const permission = await PermissionModel.findById(permissionId);
        const emp = await EmpModel.findOne({empId: permission.empId});
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        if (permission.status === 'Approved'){
            res.status(202).json({ message: 'Permission request has already been approved' });
        }
        else if(permission.status === 'Denied'){
            res.status(202).json({ message: 'Permission request has already been denied' });
        }
        else if(permission.status === 'Withdrawn'){
            res.status(202).json({ message: 'Permission request has already been withdrawn' });
        }
        else{
            permission.status = 'Denied';
            await permission.save();
            Rejected('lingeshwaran.kv2022cse@sece.ac.in')
            Message(emp.empPhone, `Dear ${emp.empName},\n\nYour Permission has been *REJECTED* ❌\n*Date:* ${permission.date}\n*From:* ${permission.from}\n*To:*${permission.to}\n*Hours:*${permission.hrs}\n\nPlease ensure that all pending tasks are handed over to the appropriate team members before your permission.\n\nBest Regards,\n*Gilbarco Veeder-Root*`)
            res.status(200).json({ message: 'Permission denied successfully', permission });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
const checkPermission = async(req, res) => {
    try{
        const { empId, date, session, hrs } = req.body;
        const fromData = await LeaveModel.find({empId: empId, "from.date": date, "from.firstHalf": true})
        const toData = await LeaveModel.find({empId: empId, "to.date": date, "to.firstHalf": true})
        const From = await LeaveModel.find({empId: empId, "from.date": date, "from.secondHalf": true})
        const To = await LeaveModel.find({empId: empId, "to.date": date, "to.secondHalf": true})
        const per = await PermissionModel.find({empId, date})
        const data = await LeaveModel.find({empId: empId, days: { $in: [date.slice(0,2)] }})
        if(data.length){
            return res.status(202).json({ mesasage: "Already permission had applied in the same day" })
        }

        if(per.length){
            return res.status(202).json({ mesasage: "Already permission had applied in the same day"})
        }

        if(session.firstHalf && (fromData.length || toData.length)){
            return res.status(202).json({ mesasage: "Already leave had applied in the same day" })
        }
        else if(session.secondHalf && (From.length || To.length)){
            return res.status(202).json({ mesasage: "Already leave had applied in the same day" })
        }
        else{
            const emp = await EmpModel.findOne({empId})
            if(!emp){
                return res.status(404).json({ message: 'Employee not found'});
            }
            if(hrs <= emp.permissionEligible){
                console.log(emp.permissionEligible)
                res.status(200).json({ message: 'Permission can be availed'})
            }
            else{
                res.status(203).json({ message: 'Permission limit exceeded'})
            }
        }
    }
    catch(err){
        res.status(500).json({ message: 'Server error', err });
    }
}

// Get permissions granted to a particular employee
const GetPermission = async (req, res) => {
    try {
        const { empId } = req.body;
        const employee = await EmpModel.findOne({empId});
        if(!employee){
            return res.status(404).json({ message: 'Employee not found' });
        }
        if(employee.role === 'Manager'){
            const permissions = await PermissionModel.find();
            res.status(200).json(permissions);
        }
        else{
            const permissions = await PermissionModel.find({ empId });
        res.status(200).json(permissions);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = {checkPermission,ApplyPermission,withDrawPermission,AcceptRejected,rejectAccepted,AcceptPermission,Accept,DenyPermission,Deny,GetPermission}