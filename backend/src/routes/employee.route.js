const express = require("express")
const router = express.Router()
const employeeController = require('../controllers/employee.controller')

router.get('/allEmp', employeeController.allEmployee)
router.get('/trash/list', employeeController.getDeletedEmployees)
router.get('/:id', employeeController.getEmployeeById)
router.post('/addEmp', employeeController.addEmployee)
router.put("/:id", employeeController.updateEmployee);
router.patch("/:id/toggle-status", employeeController.toggleEmployeeStatus);
router.delete("/:id", employeeController.softDeleteEmployee);
router.patch("/:id/restore", employeeController.restoreEmployee);

module.exports = router
