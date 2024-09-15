const router = require('express').Router();
const {sendMessage} = require('../controllers/messageController');
const checkUser = require('../middleware/auth')

router.post('/sendMessage',checkUser ,sendMessage)

module.exports = router;