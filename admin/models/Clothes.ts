import mongoose, { model, Schema } from "mongoose";

export const ClothesSchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: {
        data: Buffer,
        contentType: String,
    },
    max: Number,
    available: Number,
    ordered: Number,
})

const ClothesModel = mongoose.models.clothes || model("clothes", ClothesSchema)

export default ClothesModel
