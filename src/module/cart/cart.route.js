import { Router } from 'express'
const router = Router()
import * as uc from '../../../src/module/cart/cart.controller.js'
import { isAuth, restrictTo } from '../../Middleware/auth.js'
import { asyncHandler } from '../../utils/err.handling.js'



router.post('/addcart',
    isAuth(),restrictTo('User'),
    asyncHandler(uc.addToCart))
    
router.delete('/deletecart',
    isAuth(),restrictTo('User'),
    asyncHandler(uc.deleteFromCart))
    
router.get('/getcart',isAuth(),asyncHandler(uc.getAllproductFromCart))
router.delete('/deletecart',isAuth(),asyncHandler(uc.deleteCart))
router.delete('/deleteitemcart/:productId',isAuth(),asyncHandler(uc.deleteCartItem))
router.post('/createOrder',isAuth(),asyncHandler(uc.fromCartoOrder))

export default router