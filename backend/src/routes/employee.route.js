const express = require("express")
const router = express.Router()
const authenticate = require('../middleware/auth.middleware')
const employeeController = require('../controllers/employee.controller')
router.get('/allEmp', authenticate, employeeController.allEmployee)
router.post('/addEmp', authenticate, employeeController.addEmployee)







module.exports = router