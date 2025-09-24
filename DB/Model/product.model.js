import mongoose, { Schema, model } from 'mongoose'


const productSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            lowercase: true,
        },
        desc: String,
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },

        colors: [String],
        sizes: [String],


        price: {
            type: Number,
            required: true,
            default: 1,
        },
        appliedDiscount: {
            type: Number,
            default: 0,
        },
        priceAfterDiscount: {
            type: Number,
            default: 0,
        },


        stock: {
            type: Number,
            required: true,
            default: 1,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Seller',
            required: true,
        },

        createdAt:{
            type: Date,
            default: Date.now,
        },

        updatedAt:{
            type: Date,
            default: Date.now,
        },

        Images: [
            {
                secure_url: {
                    type: String,
                    required: true,
                },
                public_id: {
                    type: String,
                    required: true,
                },
            },
        ],
        customId: String,
    },
    { timestamps: true },
)

export const productModel = model('Product', productSchema)
