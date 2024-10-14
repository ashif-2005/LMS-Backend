const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config('./env')
const { EmpModel } = require('../models/employeeSchema')

const client = new twilio(process.env.SID, process.env.Token);

generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

sendOTP = async(req, res) => {
    try{
        const OTP = generateOTP()
        const emp = await EmpModel.findOne({empPhone: req.body.number});
        emp.otp = OTP
        await emp.save()
        const message = await client.messages.create({
            body: `${OTP} is your LMS authentication code. @Gilbarco Veeder-Root #${OTP}`,
            from: '+17758354888', 
            to: req.body.number
        });
        res.status(200).json({message: 'OTP sent successfully'})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}

verifyOTP = async(req, res) => {
    try{
        const employee = await EmpModel.findOne({empPhone: req.body.number});
        if(employee.otp != "000000" && employee.otp === req.body.otp){
            const token = jwt.sign({ empId: employee.empId, role: employee.role, empName: employee.empName, empMail: employee.empMail, managerMail: employee.reportionManager}, process.env.SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        }
        else{
            res.status(401).json({message: 'Incorrect OTP'})
        }
        setTimeout(async()=>{
            employee.otp = "000000"
            await employee.save()
        }, 60000)
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}

module.exports = {sendOTP, verifyOTP}