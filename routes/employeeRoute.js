const router = require('express').Router();
const {Register,Login,RFIDLogin,GetEmp, getAllEmp, updateEmpDetails, deleteEmp, importEmp} = require('../controllers/employeeController');
const checkUser = require('../middleware/auth')

router.post('/signin',Login)
router.post('/login',RFIDLogin)
router.post('/register',checkUser, Register)
router.post('/getEmp',checkUser ,GetEmp)
router.post('/getAll', checkUser, getAllEmp)
router.post('/update', checkUser, updateEmpDetails)
router.post('/delete', checkUser, deleteEmp)
router.post('/import', checkUser, importEmp)

module.exports = router;