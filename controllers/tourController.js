import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';

export const aliasTopTours = async (req, res, next) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price'); //rating sorting
  req.query.fields = 'name,price,ratingsAverage';

  next();
};

export const getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Get One Tour
export const getOneTour = async (req, res) => {
  // const id = req.params.id * 1; // string to number
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Create Tour
export const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// Update Tour
export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //if we want to use validations
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//   Delete Tour
export const deleteTour = async (req, res) => {
  try {
    await Tour.findOneAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Stats ---> diagrams
export const getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// If we have dates, we can sort them with dates
export const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
