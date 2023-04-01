import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appErrors.js';
import { catchAsync } from '../utils/catchAsync.js'; // automatic try/catch method
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

export const aliasTopTours = async (req, res, next) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price'); //rating sorting
  req.query.fields = 'name,price,ratingsAverage';

  next();
};

// export const getAllTours = catchAsync(async (req, res, next) => {
//   // Execute Query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });
export const getAllTours = getAll(Tour);

//// Get One Tour
// export const getOneTour = catchAsync(async (req, res, next) => {
//   // const id = req.params.id * 1; // string to number

//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   // If we need to show children objects full, we simply add > populate  like this ¬ or make middle ware without changing here.
//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: "guides",
//   //   select: "-__v -passwordChangedAt"
//   // });

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID`, 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
export const getOneTour = getOne(Tour, { path: 'reviews' });

//// Create Tour
// export const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
export const createTour = createOne(Tour);

//// Update Tour
// export const updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true, //if we want to use validations
//   });

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
export const updateTour = updateOne(Tour);

////   Delete Tour
// export const deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID`, 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
export const deleteTour = deleteOne(Tour);

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

export const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      }, // always call first
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
