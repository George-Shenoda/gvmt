import mongoose, { model, Schema } from "mongoose";

export const ClothesSchema = new Schema({
    name: String,
    image: {
        data: Buffer,
        contentType: String,
    },
    max: Number,
    available: Number,
    ordered: Number,
});

const Clothes = mongoose.models.Clothes || model("Clothes", ClothesSchema);

export default Clothes;
