const express =require('express')
const router = express.Router();
const {isAdmin, isEvaluator, auth} = require('../middleware/auth.js')
require('dotenv').config();

const authController = require('../Controllers/authController.js')
const adminController = require('../Controllers/adminController')
const evaluatorController = require('../Controllers/evaluatorController')
const employeeController = require('../Controllers/employeeController')
const reportController = require('../Controllers/reportController')


router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.get('/auth/me', auth ,authController.getme)

//admin
//evaluation
router.get('/admin/evaluations',auth, adminController.getEvaluation)
router.post('/admin/evaluations',auth, adminController.addEvaluation)
router.put('/admin/evaluations/:id', auth ,adminController.updateEvaluation)
//topics
router.get('/admin/topics',auth, adminController.getTopics)
router.post('/admin/topics',auth, adminController.addTopics)
router.put('/admin/topics/:id', auth ,adminController.updateTopics)
router.delete('/admin/topics/:id', auth ,adminController.deleteTopics)
//indicator
router.get('/admin/indicator',auth, adminController.getIndicator)
router.post('/admin/indicator',auth, adminController.addIndicator)
router.put('/admin/indicator/:id', auth ,adminController.updateIndicator)
router.delete('/admin/indicator/:id', auth ,adminController.deleteIndicator)

//employee
router.get('/employee/profile',auth ,employeeController.getProfile)
router.put('/employee/profile',auth, employeeController.updateProfile)


module.exports = router; 