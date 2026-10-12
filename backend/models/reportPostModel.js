import mongoose, { Schema } from "mongoose";

const reportPostSchema = new mongoose.Schema({
    post: { 
        type: Schema.Types.ObjectId, 
        ref: "Post", 
        required: true 
    },
    reportedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    details: {
        type: String,
        default: ""
    },
    status: { 
        type: String, 
        enum: ["pending", "resolved", "dismissed"], 
        default: "pending" 
    }
}, { timestamps: true });

export const ReportPost = mongoose.model('ReportPost', reportPostSchema);