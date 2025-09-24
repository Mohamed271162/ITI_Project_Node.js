import express from 'express'
import cors from 'cors'
import { connectionDB } from './DB/connection.js'
import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

import userRouter from './src/module/user/user.route.js'
import productRouter from './src/module/product/product.route .js'
import cartRouter from './src/module/cart/cart.route.js'
import orderRouter from './src/module/order/order.route.js'


config({ path: path.resolve('./config/.env') })
connectionDB()

const app = express()
const port = 3000
const globalResponse = (err, req, res, next) => {
    if (err) {
        return res.status(err['cause'] || 500).json({ message: err.message })
    }
}

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.json({
        message: "E-Commerce API is running!",
        timestamp: new Date().toISOString(),
        database:
            connectionDB(),
        environment: process.env.NODE_ENV,
    });
});


app.use('/auth', userRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)



// app.post('/uploads', multerFunction(allowedExtensions.Image).single('Image'), (req, res, next) => {
//     res.json({ message: 'uploaded' })
// })


// app.all('*', (req, res, next) =>
//     res.status(404).json({ message: '404 Not Found URL' }),
// )

app.use(globalResponse)

if (process.env.NODE_ENV === 'development') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

export default app