import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {type: String, required: true, trim: true},
        lastName: {type: String, required: true, trim: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        password: {type: String, required: true},
        mobile: {type: String, required: true, unique: true, trim: true},
        otp: {type: String, default: "0"},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const user = mongoose.model("user", userSchema);

export default user;