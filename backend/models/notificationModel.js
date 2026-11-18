import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true 
    },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        default: null 
    },
    type: { 
        type: String, 
        enum: ["like", "comment", "follow", "system"], 
        default: "like" 
    },
    message: { 
        type: String, 
        required: true 
    },
    post: { 
        type: Schema.Types.ObjectId, 
        ref: "Post", 
        default: null 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);