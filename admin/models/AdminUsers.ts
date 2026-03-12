import mongoose, {Schema, model} from "mongoose";

const AdminUserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
})

export const AdminUser = mongoose.models.AdminUser || model("AdminUser", AdminUserSchema);
export default AdminUser;

