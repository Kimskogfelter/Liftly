import mongoose, { Schema } from "mongoose";

const reportUserSchema = new mongoose.Schema({
    reportedUser: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
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
    status: { 
        type: String, 
        enum: ["pending", "resolved", "dismissed"], 
        default: "pending" 
    }
}, { timestamps: true });

export const ReportUser = mongoose.model('ReportUser', reportUserSchema);