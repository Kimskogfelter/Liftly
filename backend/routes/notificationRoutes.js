import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// create router
export const notificationRouter = Router();

// Hämta alla notiser för inloggad användare
notificationRouter.get('/', authMiddleware, getNotifications);

// Markera alla användarens notiser som lästa
notificationRouter.put('/read-all', authMiddleware, markAllAsRead);

// Markera en specifik notis som läst
notificationRouter.put('/:id/read', authMiddleware, markAsRead);

export default notificationRouter;