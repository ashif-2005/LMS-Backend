const router = require('express').Router();
const {sendOTP, verifyOTP} = require('../controllers/otpController')

router.post('/send', sendOTP)
router.post('/verify', verifyOTP)

module.exports = router;