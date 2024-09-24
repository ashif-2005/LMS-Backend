const { Message, checkLeave, checkStatus, unknownMessage } = require('../utils/message')

const getMessage = async(req, res) => {
    try{
        const message = req.body.Body;
        const from = req.body.From;
        console.log(from.substring(9,21))
        if(message .toLowerCase() === "check eligibility"){
            checkStatus(message, from)
        }
        else if(message .toLowerCase() === "check status"){
            checkLeave(message, from)
        }
        else{
            unknownMessage(message, from)
        }
    }
    catch(err){
        console.log('Error recieving message:');
        res.status(500).json({error: err.message});
    }
}

module.exports = {getMessage}