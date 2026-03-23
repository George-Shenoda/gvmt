import mongoose, { model, Schema } from "mongoose";

export const ClothesSchema = new Schema({
    name: {
        type: String,
        index: true,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
    max: Number,
    available: Number,
    ordered: Number,
});

ClothesSchema.index({ name: 1 });

const Clothes = mongoose.models.Clothes || model("Clothes", ClothesSchema);

export default Clothes;
