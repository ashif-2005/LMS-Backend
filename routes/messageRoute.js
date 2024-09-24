const router = require('express').Router();
const {getMessage} = require('../controllers/messageController')

router.post('/getMessage', getMessage)

module.exports = router;