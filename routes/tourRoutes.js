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
} from '../controllers/tourController.js';

const router = express.Router();

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan:year').get(getMonthlyPlan);

router.route('/').get(getAllTours).post(
  // checkBody,
  createTour
);
router.route('/:id').get(getOneTour).patch(updateTour).delete(deleteTour);

export default router;
