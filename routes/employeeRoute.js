const router = require('express').Router();
const {addAdmin, Register,Login,RFIDLogin,GetEmp, getAllEmp, updateEmpDetails, deleteEmp, importEmp, forgetPassword} = require('../controllers/employeeController');
const checkUser = require('../middleware/auth')

router.post('/add',addAdmin)
router.post('/signin',Login)
router.post('/login',RFIDLogin)
router.post('/register',checkUser, Register)
router.post('/getEmp',checkUser ,GetEmp)
router.post('/getAll', checkUser, getAllEmp)
router.post('/update', checkUser, updateEmpDetails)
router.post('/delete', checkUser, deleteEmp)
router.post('/import', checkUser, importEmp)
router.post('/forgetPassword', forgetPassword)

module.exports = router;