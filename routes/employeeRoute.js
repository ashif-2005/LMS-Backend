const router = require('express').Router();
const {RFIDLogin,Login,Register,GetEmp, getAllEmp} = require('../controllers/employeeController');
const checkUser = require('../middleware/auth')

router.post('/Login',Login)
router.post('/login',RFIDLogin)
router.post('/register',Register)
router.post('/getEmp',checkUser ,GetEmp)
router.post('/getAll', checkUser, getAllEmp)

module.exports = router;