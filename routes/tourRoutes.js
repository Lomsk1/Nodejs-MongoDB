import express from 'express';
// const tourController = require('./../controllers/tourController');
import {
  getAllTours,
  getOneTour,
  updateTour,
  deleteTour,
  // checkBody,
  createTour,
  // checkID,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImage,
  resizeTourImages,
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import { createReview } from '../controllers/reviewController.js';
import reviewRouter from '../routes/reviewRoutes.js';

const router = express.Router();

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan:year')
  .get(protect, restrictTo('user', 'lead-guide', 'guide'), getMonthlyPlan);

// we use protect if we want to get something if user is login

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(protect, getAllTours).post(
  // checkBody,
  protect,
  restrictTo('admin', 'lead-guide'),
  createTour
);
router
  .route('/:id')
  .get(getOneTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImage,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

router.use('/:tourId/reviews', reviewRouter);

export default router;
