import { userModel } from "../../DB/Model/user.model.js"
import { generateToken, verifyToken } from "../utils/generationToken.js"

export const isAuth = () => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers
            if (!authorization) {
                return next(new Error('Please login first', { cause: 400 }))
            }

            if (!authorization.startsWith('Bearer ')) {
                return next(new Error('invalid token prefix', { cause: 400 }))
            }

            const splitedToken = authorization.split(' ')[1]
            console.log("SIGN_IN_TOKEN_SECRET:", process.env.SIGN_IN_TOKEN_SECRET)


            try {
                const decodedData = verifyToken({
                    token: splitedToken,
                    signature: process.env.SIGN_IN_TOKEN_SECRET,
                })
                // console.log("Decoded Data:", decodedData)


                const findUser = await userModel.findById(
                    decodedData.id,
                    'email username role',
                )
                // console.log("User found in DB:", findUser)
                if (!findUser) {
                    return next(new Error('Please SignUp', { cause: 400 }))
                }
                req.authUser = findUser

                next()
            } catch (error) {
                // token  => search in db
                if (error == 'TokenExpiredError: jwt expired') {
                    // refresh token
                    const user = await userModel.findOne({ token: splitedToken })
                    if (!user) {
                        return next(new Error('Wrong token', { cause: 400 }))
                    }
                    // generate new token
                    const userToken = generateToken({
                        payload: {
                            email: user.email,
                            id: user._id,
                        },
                        signature: process.env.SIGN_IN_TOKEN_SECRET,
                        expiresIn: 20,
                    })

                    if (!userToken) {
                        return next(
                            new Error('token generation fail, payload canot be empty', {
                                cause: 400,
                            }),
                        )
                    }

                    user.token = userToken
                    await user.save()
                    return res.status(200).json({ message: 'Token refreshed', userToken })
                }
                return next(new Error('invalid token', { cause: 500 }))
            }
        } catch (error) {
            console.log(error)
            next(new Error('catch error in auth', { cause: 500 }))
        }
    }
}


export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.authUser.role)) {
            return res.status(403).json({ message: 'forbidden' })
        }
        next()
    }
}