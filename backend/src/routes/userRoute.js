const express = require("express")
const router = express.Router()
const userController = require('../controllers/auth.controller')
const authenticate = require("../middleware/auth.middleware")

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.get('/me', authenticate, userController.getCurrentUser)
router.put('/profile', authenticate, userController.updateProfile)

module.exports = router




// backend/
//  ├─ src/
//  │   ├─ config/
//  │   │   ├─ db.js
//  │   │   └─ env.js
//  │   │
//  │   ├─ models/
//  │   │   ├─ User.model.js
//  │   │   ├─ Course.model.js
//  │   │   ├─ Enrollment.model.js
//  │   │   └─ Assignment.model.js
//  │   │
//  │   ├─ middlewares/
//  │   │   ├─ auth.middleware.js        # JWT verify
//  │   │   ├─ role.middleware.js        # allowRoles(...)
//  │   │   └─ error.middleware.js
//  │   │
//  │   ├─ services/
//  │   │   ├─ auth.service.js
//  │   │   ├─ admin.service.js
//  │   │   ├─ tutor.service.js
//  │   │   └─ student.service.js
//  │   │
//  │   ├─ controllers/
//  │   │   ├─ auth.controller.js
//  │   │   ├─ admin.controller.js
//  │   │   ├─ tutor.controller.js
//  │   │   └─ student.controller.js
//  │   │
//  │   ├─ routes/
//  │   │   ├─ auth.routes.js
//  │   │   ├─ admin.routes.js
//  │   │   ├─ tutor.routes.js
//  │   │   └─ student.routes.js
//  │   │
//  │   ├─ utils/
//  │   │   ├─ token.js
//  │   │   └─ mail.js
//  │   │
//  │   ├─ app.js
//  │   └─ server.js
//  │
//  └─ package.json
