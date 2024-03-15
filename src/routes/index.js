import express from 'express'
import HomeController from '../controllers/home.js'
import useroute from './userRoutes.js'
let router=express.Router()


router.get('/',HomeController.homePage)
router.use('/api/v1/user', useroute)

export default router