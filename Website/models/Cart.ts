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
        index: true,
    },
    fridayDate: {
        type: String,
        required: true,
        index: true,
    },
    items: [CartItemSchema],
    submitted: {
        type: Boolean,
        default: false,
        index: true,
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

CartSchema.index({ userId: 1, fridayDate: 1 });
CartSchema.index({ submitted: 1, fridayDate: 1 });

const Cart = mongoose.models.Cart || model("Cart", CartSchema);

export default Cart;
