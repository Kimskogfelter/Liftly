import mongoose, { Schema } from "mongoose";

// schema for user
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true, maxlength: 45 },
    password: { type: String, required: true, minlength: 10 },
    profileBio: { type: String, default: "No bio yet.", maxlength: 200 },
    socialLinks: {
        instagram: { type: String, default: "" },
        tiktok: { type: String, default: "" },
        youtube: { type: String, default: "" }
    },
    profileImage: { type: String, default: "https://res.cloudinary.com/dn3kezspn/image/upload/v1794221789/Liftly_profile_avatar_image_k0znsa.png" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    refreshTokens: [{
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    pushTokens: [{
        token: { type: String, required: true },
        platform: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
        createdAt: { type: Date, default: Date.now }
    }],
    gdprConsent: {
        accepted: { type: Boolean, required: true },
        date: { type: Date, default: Date.now }
    }

}, { timestamps: true })

// user model
export const User = mongoose.model('User', userSchema)