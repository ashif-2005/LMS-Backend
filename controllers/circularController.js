const { Circular } = require("../models/circularSchema");
const { EmpModel } = require("../models/employeeSchema");
const { Message } = require("../utils/message");

const addCircular = async(req, res) => {
    try{
        const { empId, empName, message, subject, list} = req.body;
        
        const emp = await EmpModel.findOne({empId: empId});

        if(!emp){
            return res.status(404).json({ message: "Employee not found" });
        }

        list.forEach(number => {
            Message(number, `*${subject}* \n\n${message}  \n\nBest Regards,\n${empName}\n*Gilbarco Veeder-Root*`)
        })

        const circular = new Circular({empId, empName, message,subject});
        await circular.save()
        res.status(201).json(circular);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}

const getAllCirculars = async(req, res) => {
    try{
        const emp = await EmpModel.findOne({empId: req.params.empId})
        const circulars = await Circular.find({empName: emp.manager});
        res.json(circulars);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}

module.exports = {addCircular,getAllCirculars}