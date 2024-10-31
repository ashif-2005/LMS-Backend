const router = require('express').Router();
const {Register,Login,RFIDLogin,GetEmp, getAllEmp} = require('../controllers/employeeController');
const checkUser = require('../middleware/auth')

router.post('/signin',Login)
router.post('/login',RFIDLogin)
router.post('/register',Register)
router.post('/getEmp',checkUser ,GetEmp)
router.post('/getAll', checkUser, getAllEmp)

module.exports = router;