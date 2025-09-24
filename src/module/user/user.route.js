import { Router } from 'express'
const router = Router()
import * as ac from './user.controller.js'
import { asyncHandler } from '../../utils/err.handling.js'
import { isAuth } from '../../Middleware/auth.js'


router.post('/', asyncHandler(ac.signUp))
router.get('/confirm/:token', asyncHandler(ac.confirmEmail))

router.post('/login', asyncHandler(ac.logIn))
router.post('/forget', asyncHandler(ac.forgetPassword))
router.post('/reset/:token', asyncHandler(ac.resetPassword))
router.post('/logout', isAuth(), asyncHandler(ac.logOut))

export default router