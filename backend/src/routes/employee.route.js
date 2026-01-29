const express = require("express")
const router = express.Router()
const authenticate = require('../middleware/auth.middleware')
const allowRoles = require('../middleware/role.middleware');
const employeeController = require('../controllers/employee.controller')

// router.use(authenticate, allowRoles("admin"));


router.get('/allEmp', employeeController.allEmployee)
router.post('/addEmp', employeeController.addEmployee)
router.put("/:id", employeeController.updateEmployee);
router.patch("/:id/toggle-status", employeeController.toggleEmployeeStatus);
// router.get('/allEmp', authenticate, allowRoles("admin"), employeeController.allEmployee)
// router.post('/addEmp', authenticate, allowRoles("admin"), employeeController.addEmployee)
// router.put("/:id", authenticate, allowRoles("admin"), employeeController.updateEmployee);
// router.patch("/:id/toggle-status", authenticate, allowRoles("admin"), employeeController.toggleEmployeeStatus);



module.exports = router