import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appErrors.js';
import { catchAsync } from '../utils/catchAsync.js'; // automatic try/catch method

export const aliasTopTours = async (req, res, next) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price'); //rating sorting
  req.query.fields = 'name,price,ratingsAverage';

  next();
};

export const getAllTours = catchAsync(async (req, res, next) => {
  // Execute Query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

// Get One Tour
export const getOneTour = catchAsync(async (req, res, next) => {
  // const id = req.params.id * 1; // string to number

  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Create Tour
export const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// Update Tour
export const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, //if we want to use validations
  });

  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//   Delete Tour
export const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOneAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Stats ---> diagrams
export const getTourStats = async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        rating: { $gte: 2 },
      },
    },
    {
      $group: {
        // _id: 'difficulty', // show this key's value and match similar objects
        _id: null,
        numTours: { $sum: 1 }, // all tours number
        numPrices: { $sum: '$price' }, // all price sum
        avgRating: { $avg: '$rating' },
        avgPrice: { $avg: '$price' }, //field name
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { $avgPrice: 1 }, //if we sort them _id: 'something'
    },
    // {
    //   $match: {
    //     _id: { $ne: 'something that we use as a group field' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
};

// If we have dates, we can sort them with dates
export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //Monthly group
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' }, //making arr
      },
    },
    {
      $addFields: { month: '$_id' }, //add _id value to month
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStart: -1 }, // high to low
    },
    {
      $limit: 6, // only 6 object
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
