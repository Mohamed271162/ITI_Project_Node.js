import { cartModel } from "../../../DB/Model/cart.model.js"
import { orderModel } from "../../../DB/Model/order.model.js"
import { productModel } from "../../../DB/Model/product.model.js"

export const addToCart = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId, quantity } = req.body

    // ================== product check ==============
    const productCheck = await productModel.findOne({
        _id: productId,
        stock: { $gte: quantity },
    })
    if (!productCheck) {
        return next(
            new Error('inavlid product please check the quantity', { cause: 400 }),
        )
    }

    const userCart = await cartModel.findOne({ userId }).lean()
    if (userCart) {
        // update quantity
        let productExists = false
        for (const product of userCart.products) {
            if (productId == product.productId) {
                productExists = true
                product.quantity = quantity
            }
        }
        // push new product
        if (!productExists) {
            userCart.products.push({ productId, quantity })
        }

        // subTotal
        let subTotal = 0
        for (const product of userCart.products) {
            const productExists = await productModel.findById(product.productId)
            subTotal += productExists.priceAfterDiscount * product.quantity || 0
        }
        const newCart = await cartModel.findOneAndUpdate(
            { userId },
            {
                subTotal,
                products: userCart.products,
            },
            {
                new: true,
            },
        )
        return res.status(200).json({ message: 'Done', newCart })
    }

    const cartObject = {
        userId,
        products: [{ productId, quantity }],
        subTotal: productCheck.priceAfterDiscount * quantity,
    }
    const cartDB = await cartModel.create(cartObject)
    res.status(201).json({ message: 'Done', cartDB })
}

// ======================= delete from cart ==================
export const deleteFromCart = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.body

    // ================== product check ==============
    const productCheck = await productModel.findOne({
        _id: productId,
    })
    if (!productCheck) {
        return next(new Error('inavlid product id', { cause: 400 }))
    }

    const userCart = await cartModel.findOne({
        userId,
        'products.productId': productId,
    })
    if (!userCart) {
        return next(new Error('no productId in cart '))
    }
    userCart.products.forEach((ele) => {
        if (ele.productId == productId) {
            userCart.products.splice(userCart.products.indexOf(ele), 1)
        }
    })
    await userCart.save()
    res.status(200).json({ message: 'Done', userCart })
}


export const fromCartoOrder = async (req, res, next) => {
    const userId = req.authUser
    const { cartId } = req.query
    const { address, phoneNumbers, paymentMethod } = req.body

    const cart = await cartModel.findById(cartId)
    if (!cart) {
        return next(new Error('please fill your cart first', { cause: 400 }))
    }

    let subTotal = cart.subTotal
    //====================== paid Amount =================
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

// Delete entire cart
export const deleteCart = async (req, res, next) => {
    const { id } = req.authUser

    let cart = await cartModel.findOneAndDelete({ userId: id.toString() });
    if (!cart)
        return next(new Error('cart not found', { cause: 400 }))
    res.json({ message: "Cart deleted" });
}

//  Delete cart item
export const deleteCartItem = async (req, res, next) => {
    const { productId } = req.params
    const { id } = req.authUser


    let cart = await cartModel.findOneAndUpdate(
        { userId: id.toString() },
        { $pull: { cartItems: { _id: productId } } },
        { new: true }
    );
    console.log(cart);
    res.json({ message: "Deleted", cart });
}



export const getAllproductFromCart = async (req, res, next) => {
    const { id } = req.authUser
    const cart = await cartModel.findOne({ userId: id })
    if (!cart) {
        return res.json({ message: 'invalid cart id' })
    }
    res.status(200).json({ message: 'Done', cart })
}