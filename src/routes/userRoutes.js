import express from 'express'
import userController from '../controllers/userController.js'
let router=express.Router()

router.get('/',userController.getAllUsers)
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)
router.get('/logout',userController.logoutUser)
router.post('/password/forgot',userController.forgotPassword)
router.post('/password/reset/:token',userController.resetPassword)

export default router

