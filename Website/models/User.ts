import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [
            "كيجي",
            "اولي وتانيه",
            "تالته ورابعه بنين",
            "تالته ورابعه بنات",
            "خامسه وسادسه بنين",
            "خامسه وسادسه بنات",
            "اعدادي بنين",
            "اعدادي بنات",
            "ثانوي بنين",
            "ثانوي بنات",
            "شباب",
            "خريجين",
            "الحكمه",
            "مار يوحنا",
            "اخوه الرب",
            "مدرسه الشمامسه",
            "خدمه مستر بيتر سامي",
        ],
        unique: true,
        required: true,
    },
});

const User = mongoose.models.User || model("User", UserSchema);

export default User;
