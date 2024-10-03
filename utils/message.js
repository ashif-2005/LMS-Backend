const twilio = require('twilio');
const { EmpModel } = require('../models/employeeSchema')
const { LeaveModel } = require('../models/leaveSchema'); 
const { CasualLeave } = require('../models/casualLeaveSchema');
const { PrivelageLeave } = require('../models/privelageLeaveSchema');
const { PaternityLeave } = require('../models/paternityLeaveSchema');
const { AdoptionLeave } = require('../models/adoptionLeaveModel');

// Twilio credentials   
const client = new twilio(process.env.SID, process.env.Token);

const Message = async(to, message) => {
    try {
        // Send the message via Twilio
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
            to: `whatsapp:${to}`
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}

const checkLeave = async(message, number) => {
    try{
        console.log("Check Leave")
        const emp = await EmpModel.findOne({empPhone: number.substring(9,22)})
        console.log(emp)
        if(emp){
            const leave = await LeaveModel.find({empId: emp.empId}).sort({ today: -1 }).limit(1)
            console.log(leave)
            if(leave.length){
                const msg = `Dear *${emp.empName}*, your leave request on ${leave[0].from.date} is ${leave[0].status}.\n *Leave Details:*\n *Leave Type:* ${leave[0].leaveType}\n *From:* ${leave[0].from.date}\n *To:* ${leave[0].to.date}\n *Days:* ${leave[0].leaveDays} \n\nBest Regards,\n*Gilbarco Veeder-Root*`
                const response = await client.messages.create({
                    body: msg,
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
            else{
                const response = await client.messages.create({
                    body: "You have not applied any leave",
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
        }
    }
    catch(err){
        console.log(err)
    }
}

const checkStatus = async(message, number) => {
    try{
        console.log("Check status")
        const emp = await EmpModel.findOne({empPhone: number.substring(9,22)})
        if(emp.role === '3P'){
            const cl = await CasualLeave.findOne({empId: emp.empId})
            const msg = `Dear *${emp.empName}*, your leave eligibility details:\n*Casual Leave:* \n\t *Availed:* ${cl.availed} \n\t *Balance:* ${cl.closingBalance} \n\t *LOP:* ${cl.LOP}\n\nBest Regards,\n*Gilbarco Veeder-Root*`
            const response = await client.messages.create({
                body: msg,
                from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                to: number
            });
        }
        else{
            const cl = await CasualLeave.findOne({empId: emp.empId})
            const pl = await PrivelageLeave.findOne({empId: emp.empId})
            if(emp.isPaternity === false && emp.isAdpt === false){
                console.log(cl)
                console.log(pl)
                const msg = `Dear *${emp.empName}*, your leave eligibility details:\n*Casual Leave:* \n\t *Availed:* ${cl.availed} \n\t *Balance:* ${cl.closingBalance} \n\t *LOP:* ${cl.LOP} \n*Privilege Leave:* \n\t *Availed:* ${pl.availed} \n\t *Balance:* ${pl.closingBalance} \n\t *LOP:* ${pl.LOP}\n\nBest Regards,\n*Gilbarco Veeder-Root*`
                const response = await client.messages.create({
                    body: msg,
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
            else if(emp.isPaternity === true && emp.isAdpt === false){
                const p = await PaternityLeave.findOne({empId: emp.empId})
                const msg = `Dear *${emp.empName}*, your leave eligibility details:\n*Casual Leave:* \n\t *Availed:* ${cl.availed} \n\t *Balance:* ${cl.closingBalance} \n\t *LOP:* ${cl.LOP} \n*Privilege Leave:* \n\t *Availed:* ${pl.availed} \n\t *Balance:* ${pl.closingBalance} \n\t *LOP:* ${pl.LOP} \n *Paternity Leave:* \n\t *Availed:* ${p.availed} \n\t *Balance:* ${p.closingBalance} \n\t *LOP:* ${p.LOP}\n\nBest Regards,\n*Gilbarco Veeder-Root*`
                const response = await client.messages.create({
                    body: msg,
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
            else if(emp.isPaternity === false && emp.isAdpt === true){
                const Adpt = await PaternityLeave.findOne({empId: emp.empId})
                const msg = `Dear *${emp.empName}*, your leave eligibility details:\n*Casual Leave:* \n\t *Availed:* ${cl.availed} \n\t *Balance:* ${cl.closingBalance} \n\t *LOP:* ${cl.LOP} \n*Privilege Leave:* \n\t *Availed:* ${pl.availed} \n\t *Balance:* ${pl.closingBalance} \n\t *LOP:* ${pl.LOP} \n *Adoption Leave:* \n\t *Availed:* ${Adpt.availed} \n\t *Balance:* ${Adpt.closingBalance} \n\t *LOP:* ${Adpt.LOP}\n\nBest Regards,\n*Gilbarco Veeder-Root*`
                const response = await client.messages.create({
                    body: msg,
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
            else{
                const p = await PaternityLeave.findOne({empId: emp.empId})
                const Adpt = await PaternityLeave.findOne({empId: emp.empId})
                const msg = `Dear *${emp.empName}*, your leave eligibility details:\n*Casual Leave:* \n\t *Availed:* ${cl.availed} \n\t *Balance:* ${cl.closingBalance} \n\t *LOP:* ${cl.closingBalance} \n*Privilege Leave:* \n\t *Availed:* ${pl.availed} \n\t *Balance:* ${pl.closingBalance} \n\t *LOP:* ${pl.closingBalance} \n *Adoption Leave:* \n\t *Availed:* ${Adpt.availed} \n\t *Balance:* ${Adpt.closingBalance} \n\t *LOP:* ${Adpt.LOP} \n *Paternity Leave:* \t *Availed:* ${p.availed} \n\t *Balance:* ${p.closingBalance} \n\t *LOP:* ${p.LOP}\n\nBest Regards,\n*Gilbarco Veeder-Root*`
                const response = await client.messages.create({
                    body: msg,
                    from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
                    to: number
                });
            }
        }
    }
    catch(err){
        console.log(err)
    }
}

const unknownMessage = async(message, number) => {
    try{
        console.log("Unknown message")
        const msg = 'Invalid command. Please use "check eligibility" to check your leave eligibility or "check status" to check the status of the applied last leave.';
        const response = await client.messages.create({
            body: msg,
            from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
            to: number
        });
    }
    catch(err){
        console.log(err)
    }
}

module.exports = { Message, checkLeave, checkStatus, unknownMessage }