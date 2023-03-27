import User from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});
export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rout is not',
  });
};
export const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rout is not',
  });
};
export const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rout is not',
  });
};
export const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rout is not',
  });
};
