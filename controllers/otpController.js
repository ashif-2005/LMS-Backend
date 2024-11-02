const twilio = require("twilio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config("./env");
const { EmpModel } = require("../models/employeeSchema");

const client = new twilio(process.env.SID, process.env.Token);

generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async(req, res) => {
    try{
        const OTP = generateOTP()
        const emp = await EmpModel.findOne({userName: req.body.userName});
        const otp = bcrypt.hash(OTP, 10);
        emp.otp = otp
        await emp.save()
        const message = await client.messages.create({
            body: `${OTP} is your LMS authentication code. @Gilbarco Veeder-Root #${OTP}`,
            from: '+19252353064', 
            to: emp.empPhone
        });
        res.status(200).json({message: 'OTP sent successfully'})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}

const verifyOTP = async (req, res) => {
  try {
    const employee = await EmpModel.findOne({ userName: req.body.userName });
    if (req.body.otp != "000000") {
      const isMatch = await bcrypt.compare(req.body.otp, employee.otp);
      if (!isMatch) {
        // const token = jwt.sign(
        //   {
        //     empId: employee.empId,
        //     role: employee.role,
        //     empName: employee.empName,
        //     empMail: employee.empMail,
        //     managerMail: employee.reportionManager,
        //   },
        //   process.env.SECRET,
        //   { expiresIn: "1h" }
        // );
        res.status(200).json({ message: "OTP verified successful", token });
      }
    } else {
      res.status(401).json({ message: "Incorrect OTP" });
    }
    setTimeout(async () => {
      const temp = "000000";
      const hashedOTP = bcrypt.hash(temp, 10);
      employee.otp = hashedOTP;
      await employee.save();
    }, 60000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {sendOTP, verifyOTP}
