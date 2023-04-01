import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} from '../controllers/userController.js';
import {
  forgetPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signUp,
  updatePassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgotPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect); // after this, everything needs to be authorized

router.patch('/updateMyPassword', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin')); // after this, only admin can send this requests

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
