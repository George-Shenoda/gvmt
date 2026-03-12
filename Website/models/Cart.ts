import mongoose, { Schema, model } from "mongoose";

const CartItemSchema = new Schema({
    clothesId: {
        type: Schema.Types.ObjectId,
        ref: "Clothes",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
});

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fridayDate: {
        type: String,
        required: true,
    },
    items: [CartItemSchema],
    submitted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Cart = mongoose.models.Cart || model("Cart", CartSchema);

export default Cart;
