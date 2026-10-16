import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getUser, getUsers, updateAccount, followUser, unfollowUser, getFollowing, getFollowers, reportUser, editProfile, changeProfileImage, deleteUser, getSavedPosts, authUser, changePassword, forgotPassword, resetPassword, refreshToken} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/cloudinaryUpload.js'

// create router
export const userRouter = Router();


// ---------------------------- user routes --------------------------- 
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/refresh', refreshToken);
userRouter.post('/logout', logoutUser);

userRouter.get('/', authMiddleware, getUsers)

userRouter.patch('/updateAccount', authMiddleware, updateAccount) 
userRouter.patch('/editProfile', authMiddleware, editProfile) 

userRouter.post('/profile-image',authMiddleware, upload.single("profileImage"), changeProfileImage) 

userRouter.post('/:userId/follow',authMiddleware, followUser) 
userRouter.delete('/:userId/unfollow',authMiddleware, unfollowUser) 

userRouter.get('/:userId/following', authMiddleware, getFollowing);
userRouter.get('/:userId/followers', authMiddleware, getFollowers);

userRouter.post('/:userId/report', authMiddleware, reportUser);

// ---------------------------- user saved posts --------------------------- 
userRouter.get('/savedposts', authMiddleware, getSavedPosts)

// ---------------------------- user auth token verification --------------------------- 
userRouter.get('/verify', authMiddleware, authUser)

userRouter.get('/:userId', authMiddleware, getUser)
userRouter.delete('/:userId', authMiddleware, deleteUser)

// ---------------------------- forgot/reset/change password --------------------------- 
userRouter.patch('/change-password', authMiddleware, changePassword);
userRouter.post('/forgot-password', forgotPassword)
userRouter.patch('/reset-password/:token', resetPassword)



