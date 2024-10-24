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

<<<<<<< HEAD
sendOTP = async (req, res) => {
  try {
    const OTP = generateOTP();
    const emp = await EmpModel.findOne({ empPhone: req.body.number });
    const hashedOTP = bcrypt.hash(OTP, 10);
    emp.otp = hashedOTP;
    await emp.save();
    const message = await client.messages.create({
      body: `${OTP} is your LMS authentication code. @Gilbarco Veeder-Root #${OTP}`,
      from: "+17758354888",
      to: req.body.number,
    });
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
=======
sendOTP = async(req, res) => {
    try{
        const OTP = generateOTP()
        const emp = await EmpModel.findOne({empPhone: req.body.number});
        emp.otp = OTP
        await emp.save()
        const message = await client.messages.create({
            body: `${OTP} is your LMS authentication code. @Gilbarco Veeder-Root #${OTP}`,
            from: '+19252353064', 
            to: req.body.number
        });
        res.status(200).json({message: 'OTP sent successfully'})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
}
>>>>>>> 37d2c2c472a7f4f4859f22b634535ca0d3b7abba

verifyOTP = async (req, res) => {
  try {
    const employee = await EmpModel.findOne({ empPhone: req.body.number });
    if (req.body.otp != "000000") {
      const isMatch = await bcrypt.compare(req.body.otp, employee.otp);
    } else {
      res.status(401).json({ message: "Incorrect OTP" });
    }
    if (!isMatch) {
      const token = jwt.sign(
        {
          empId: employee.empId,
          role: employee.role,
          empName: employee.empName,
          empMail: employee.empMail,
          managerMail: employee.reportionManager,
        },
        process.env.SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({ message: "Login successful", token });
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

<<<<<<< HEAD
module.exports = { sendOTP, verifyOTP };
=======
module.exports = {sendOTP, verifyOTP}
>>>>>>> 37d2c2c472a7f4f4859f22b634535ca0d3b7abba
