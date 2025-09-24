import { cartModel } from "../../../DB/Model/cart.model.js"
import { orderModel } from "../../../DB/Model/order.model.js"
import { productModel } from "../../../DB/Model/product.model.js"


// ========================== create order =================
export const createOrder = async (req, res, next) => {
    const userId = req.authUser
    const {
        productId,
        quantity,
        address,
        phoneNumbers,
        paymentMethod,
    } = req.body



    // ====================== products check ================
    const products = []
    const isProductValid = await productModel.findOne({
        _id: productId,
        stock: { $gte: quantity },
    })
    if (!isProductValid) {
        return next(
            new Error('invalid product please check your quantity', { cause: 400 }),
        )
    }
    const productObject = {
        productId,
        quantity,
        title: isProductValid.title,
        price: isProductValid.priceAfterDiscount,
        finalPrice: isProductValid.priceAfterDiscount * quantity,
    }
    products.push(productObject)

    //===================== subTotal ======================
    const subTotal = productObject.finalPrice
    //====================== paid Amount =================
   let paidAmount = subTotal
    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    const orderObject = {
        userId,
        products,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
    }
    const orderDB = await orderModel.create(orderObject)
    if (orderDB) {

        // decrease product's stock by order's product quantity
        await productModel.findOneAndUpdate(
            { _id: productId },
            {
                $inc: { stock: -parseInt(quantity) },
            },
        )

        //TODO: remove product from userCart if exist

        return res.status(201).json({ message: 'Done', orderDB })
    }
    return next(new Error('fail to create your order', { cause: 400 }))
}


// =========================== create order from cart products ====================
export const fromCartoOrder = async (req, res, next) => {
    const userId = req.authUser
    const { cartId } = req.query
    const { address, phoneNumbers, paymentMethod } = req.body

    const cart = await cartModel.findById(cartId)
    if (!cart) {
        return next(new Error('please fill your cart first', { cause: 400 }))
    }

    let subTotal = cart.subTotal
    let paidAmount = 0
    paidAmount = subTotal

    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')
    let orderProduct = []
    for (const product of cart.products) {
        const productExist = await productModel.findById(product.productId)
        orderProduct.push({
            productId: product.productId,
            quantity: product.quantity,
            title: productExist.title,
            price: productExist.priceAfterDiscount,
            finalPrice: productExist.priceAfterDiscount * product.quantity,
        })
    }

    const orderObject = {
        userId,
        products: orderProduct,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,

    }
    const orderDB = await orderModel.create(orderObject)
    if (orderDB) {
        // decrease product's stock by order's product quantity
        for (const product of cart.products) {
            await productModel.findOneAndUpdate(
                { _id: product.productId },
                {
                    $inc: { stock: -parseInt(product.quantity) },
                },
            )
        }

        //TODO: remove product from userCart if exist
        cart.products = []
        await cart.save()

        return res.status(201).json({ message: 'Done', orderDB, cart })
    }
    return next(new Error('fail to create your order', { cause: 400 }))
}