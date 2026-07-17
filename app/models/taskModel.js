import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        status: {
            type: String,
            trim: true,
            required: true,
            enum: ["New", "In Progress", "Completed", "Cancelled"]
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
)

const tasks = mongoose.model("task", taskSchema)

export default tasks
