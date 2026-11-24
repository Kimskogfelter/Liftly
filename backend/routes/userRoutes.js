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

// ---------------------------- user routes ---------------------------
userRouter.post('/register', registerUserLimiter, registerUser);
userRouter.get('/verify-email/:token', verifyEmail);
userRouter.post('/login', loginUser);
userRouter.post('/refresh', refreshToken);
userRouter.post('/logout', logoutUser);

// Kräver inloggning: hämtar användarlistan
userRouter.get('/', authMiddleware, getUsers);

// Public route so logged-out visitors can view shared profile links (no authMiddleware)
userRouter.get('/:userId', getUser);

// Kräver inloggning: uppdatering av konto, profil och profilbild
userRouter.patch('/updateAccount', authMiddleware, updateAccount);
userRouter.patch('/editProfile', authMiddleware, editProfile);
userRouter.post('/profile-image', authMiddleware, upload.single('profileImage'), changeProfileImage);

// Kräver inloggning: följa, avfölja, följarlistor och rapportering
userRouter.post('/:userId/follow', authMiddleware, followUser);
userRouter.delete('/:userId/unfollow', authMiddleware, unfollowUser);
userRouter.get('/:userId/following', authMiddleware, getFollowing);
userRouter.get('/:userId/followers', authMiddleware, getFollowers);
userRouter.post('/:userId/report', authMiddleware, reportUser);

// ---------------------------- user saved posts ---------------------------
// Placerad före /:userId så att "savedposts" inte tolkas som ett användar-ID
userRouter.get('/savedposts', authMiddleware, getSavedPosts);

// ---------------------------- user auth token verification ---------------------------
// Placerad före /:userId så att "verify" inte tolkas som ett användar-ID
userRouter.get('/verify', authMiddleware, authUser);
userRouter.delete('/:userId', authMiddleware, deleteUser);

// ---------------------------- forgot/reset/change password ---------------------------
userRouter.patch('/change-password', authMiddleware, changePassword);
userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);

// ---------------------------- push notifications ---------------------------
userRouter.post('/save-push-token', authMiddleware, savePushToken);