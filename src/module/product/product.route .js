import { Router } from "express";
import { multerCloudFunction } from "../../Services/multerCloudFunction.js";
import { allowedExtensions } from "../../utils/allowedExtention.js";
import { asyncHandler } from "../../utils/err.handling.js";
import * as pc from '../product/product.controller.js'
import { isAuth, restrictTo } from "../../Middleware/auth.js";
const router = Router()


router.post('/add', isAuth(), restrictTo('Seller','Admin'), multerCloudFunction(allowedExtensions.Image).array('image', 2), asyncHandler(pc.addProduct))
router.post('/update',isAuth(), restrictTo('Seller','Admin'), multerCloudFunction(allowedExtensions.Image).array('image', 2), asyncHandler(pc.updateproduct))
router.get('/', asyncHandler(pc.getProdByPagination))
router.get('/title', asyncHandler(pc.getProductsByName))

router.delete('/delete',isAuth(),restrictTo('Seller','Admin'), asyncHandler(pc.deleteProduct))

export default router