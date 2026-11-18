import { HttpError } from "../models/errorModel.js";
import { Notification } from "../models/notificationModel.js";
import mongoose from "mongoose";

// ---------------------------- GET NOTIFICATIONS --------------------------- 
// GET req: api/notifications
// PROTECTED
export const getNotifications = async (req, res, next) => {
    try {
        // Hämta alla notiser för den inloggade användaren, nyaste först
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate("sender", "username profileImage")
            .sort({ createdAt: -1 });

        return res.status(200).json(notifications);

    } catch (error) {
        return next(new HttpError(error.message || "Could not fetch notifications", 500));
    }
};

// ---------------------------- MARK AS READ --------------------------- 
// PUT req: api/notifications/:id/read
// PROTECTED
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new HttpError("Notification Id is not valid", 404));
        }

        const notification = await Notification.findById(id);

        if (!notification) {
            return next(new HttpError("Notification not found", 404));
        }

        // Kontrollera att notisen tillhör den inloggade användaren
        if (!notification.recipient.equals(req.user.id)) {
            return next(new HttpError("You are not allowed to update this notification", 403));
        }

        notification.read = true;
        await notification.save();

        return res.status(200).json({ message: "Notification marked as read", notification });

    } catch (error) {
        return next(new HttpError(error.message || "Could not update notification", 500));
    }
};

// ---------------------------- MARK ALL AS READ --------------------------- 
// PUT req: api/notifications/read-all
// PROTECTED
export const markAllAsRead = async (req, res, next) => {
    try {
        // Uppdatera alla olästa notiser för inloggad användare till lästa
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );

        return res.status(200).json({ message: "All notifications marked as read" });

    } catch (error) {
        return next(new HttpError(error.message || "Could not update notifications", 500));
    }
};