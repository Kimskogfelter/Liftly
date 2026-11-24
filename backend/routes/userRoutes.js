import { Router } from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getUser,
  getUsers,
  updateAccount,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  reportUser,
  editProfile,
  changeProfileImage,
  deleteUser,
  getSavedPosts,
  authUser,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  savePushToken
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerUserLimiter } from '../middleware/registerUserLimiter.js';
import { upload } from '../middleware/cloudinaryUpload.js';

// Skapar router för användare, profil, följning och autentisering
export const userRouter = Router();

// ---------------------------- AUTH & SESSION ---------------------------
userRouter.post('/register', registerUserLimiter, registerUser);
userRouter.get('/verify-email/:token', verifyEmail);
userRouter.post('/login', loginUser);
userRouter.post('/refresh', refreshToken);
userRouter.post('/logout', logoutUser);

// ---------------------------- PASSWORD & PUSH ---------------------------
userRouter.patch('/change-password', authMiddleware, changePassword);
userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);
userRouter.post('/save-push-token', authMiddleware, savePushToken);

// ---------------------------- CURRENT USER / ACCOUNT ---------------------------
// Placerade före /:userId så att statiska namn inte tolkas som ett userId
userRouter.get('/verify', authMiddleware, authUser);
userRouter.get('/savedposts', authMiddleware, getSavedPosts);
userRouter.patch('/updateAccount', authMiddleware, updateAccount);
userRouter.patch('/editProfile', authMiddleware, editProfile);
userRouter.post('/profile-image', authMiddleware, upload.single('profileImage'), changeProfileImage);

// ---------------------------- USERS & PUBLIC PROFILE ---------------------------
// Kräver inloggning: hämtar användarlistan
userRouter.get('/', authMiddleware, getUsers);

// Public route so logged-out visitors can view shared profile links (no authMiddleware)
userRouter.get('/:userId', getUser);
userRouter.delete('/:userId', authMiddleware, deleteUser);

// ---------------------------- FOLLOW & REPORT ---------------------------
userRouter.post('/:userId/follow', authMiddleware, followUser);
userRouter.delete('/:userId/unfollow', authMiddleware, unfollowUser);
userRouter.get('/:userId/following', authMiddleware, getFollowing);
userRouter.get('/:userId/followers', authMiddleware, getFollowers);
userRouter.post('/:userId/report', authMiddleware, reportUser);