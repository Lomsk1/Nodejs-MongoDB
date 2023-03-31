import User from '../models/userModel.js';
import AppError from '../utils/appErrors.js';
import { catchAsync } from '../utils/catchAsync.js';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This Route is not for password update. Please only update data',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields that are not allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email'); // that we are allowed to change

  // 3) Update user document

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

// Don't update password like that!
export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);
