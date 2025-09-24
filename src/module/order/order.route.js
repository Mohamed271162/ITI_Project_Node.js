import { Router } from 'express'
const router = Router()
import * as oc from './order.controller.js'
import { isAuth } from '../../Middleware/auth.js'
import { asyncHandler } from '../../utils/err.handling.js'

router.post('/createorder', isAuth(), asyncHandler(oc.createOrder))
router.post('/orderCart', isAuth(), asyncHandler(oc.fromCartoOrder))

export default router